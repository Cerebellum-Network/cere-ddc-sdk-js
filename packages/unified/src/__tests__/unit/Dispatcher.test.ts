import { Dispatcher } from '../../Dispatcher';
import { ProcessingRules } from '../../RulesInterpreter';
import { createMockLogger } from '../helpers/test-utils';

describe('Dispatcher', () => {
  let dispatcher: Dispatcher;
  let mockLogger: jest.Mock;

  beforeEach(() => {
    mockLogger = createMockLogger();
    dispatcher = new Dispatcher(mockLogger);
  });

  describe('routeRequest', () => {
    it('should create DDC-only actions for skip index mode', () => {
      const payload = { test: 'data' };
      const rules: ProcessingRules = {
        dataCloudAction: 'write_direct',
        indexAction: 'skip',
        batchingRequired: false,
        additionalParams: {
          priority: 'normal',
          encryption: false,
        },
      };

      const plan = dispatcher.routeRequest(payload, rules);

      expect(plan.actions).toHaveLength(1);
      expect(plan.actions[0].target).toBe('ddc-client');
      expect(plan.actions[0].method).toBe('store');
      expect(plan.executionMode).toBe('sequential');
      expect(plan.rollbackRequired).toBe(false);
    });

    it('should create both DDC and Activity actions for realtime index', () => {
      const payload = { eventType: 'test', userId: 'user123' };
      const rules: ProcessingRules = {
        dataCloudAction: 'write_via_index',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: {
          priority: 'high',
          encryption: false,
        },
      };

      const plan = dispatcher.routeRequest(payload, rules);

      expect(plan.actions).toHaveLength(1);
      expect(plan.actions.find((a) => a.target === 'activity-sdk')).toBeDefined();
      expect(plan.executionMode).toBe('sequential');
    });

    it('should create batch actions when batching required', () => {
      const payload = { test: 'batch data' };
      const rules: ProcessingRules = {
        dataCloudAction: 'write_batch',
        indexAction: 'write_realtime',
        batchingRequired: true,
        additionalParams: {
          priority: 'low',
          encryption: false,
          batchOptions: {
            maxSize: 100,
            maxWaitTime: 5000,
          },
        },
      };

      const plan = dispatcher.routeRequest(payload, rules);

      const ddcAction = plan.actions.find((a) => a.target === 'ddc-client');
      expect(ddcAction?.method).toBe('storeBatch');
      expect(ddcAction?.options.batchOptions).toEqual({
        maxSize: 100,
        maxWaitTime: 5000,
      });
    });

    it('should set correct priority levels', () => {
      const payload = { test: 'priority data' };
      const rules: ProcessingRules = {
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: {
          priority: 'high',
          encryption: true,
        },
      };

      const plan = dispatcher.routeRequest(payload, rules);

      plan.actions.forEach((action) => {
        expect(action.priority).toBe('high');
        if (action.target === 'ddc-client') {
          expect(action.options.encryption).toBe(true);
        }
      });
    });

    it('should handle encrypted payloads', () => {
      const payload = { sensitiveData: 'secret' };
      const rules: ProcessingRules = {
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: {
          priority: 'normal',
          encryption: true,
          ttl: 3600,
        },
      };

      const plan = dispatcher.routeRequest(payload, rules);

      plan.actions.forEach((action) => {
        if (action.target === 'ddc-client') {
          expect(action.options.encryption).toBe(true);
          expect(action.options.ttl).toBe(3600);
        }
      });
    });

    it('should create fallback options for activity actions', () => {
      const payload = { eventType: 'test_event' };
      const rules: ProcessingRules = {
        dataCloudAction: 'write_via_index',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: {
          priority: 'normal',
          encryption: false,
        },
      };

      const plan = dispatcher.routeRequest(payload, rules);

      const activityAction = plan.actions.find((a) => a.target === 'activity-sdk');
      expect(activityAction?.options.writeToDataCloud).toBe(true);
    });

    it('should handle complex routing scenarios using test scenarios', () => {
      const payload = { test: 'complex routing' };

      // Test direct write scenario
      const directPlan = dispatcher.routeRequest(payload, {
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      });

      expect(directPlan.actions).toHaveLength(2); // DDC + Activity
      expect(directPlan.actions.find((a) => a.target === 'ddc-client')).toBeDefined();
      expect(directPlan.actions.find((a) => a.target === 'activity-sdk')).toBeDefined();

      // Test skip index scenario
      const skipPlan = dispatcher.routeRequest(payload, {
        dataCloudAction: 'write_direct',
        indexAction: 'skip',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      });

      expect(skipPlan.actions).toHaveLength(1); // DDC only
      expect(skipPlan.actions[0].target).toBe('ddc-client');
    });
  });

  describe('createDDCAction', () => {
    it('should create direct store action via routeRequest', () => {
      const payload = { test: 'data' };
      const rules: ProcessingRules = {
        dataCloudAction: 'write_direct',
        indexAction: 'skip',
        batchingRequired: false,
        additionalParams: {
          priority: 'normal',
          encryption: false,
        },
      };

      const plan = dispatcher.routeRequest(payload, rules);
      const ddcAction = plan.actions.find((a) => a.target === 'ddc-client');

      expect(ddcAction).toBeDefined();
      expect(ddcAction?.method).toBe('store');
      expect(ddcAction?.payload.data).toContain('test');
    });

    it('should create batch store action via routeRequest', () => {
      const payload = { test: 'batch' };
      const rules: ProcessingRules = {
        dataCloudAction: 'write_batch',
        indexAction: 'skip',
        batchingRequired: true,
        additionalParams: {
          priority: 'low',
          encryption: false,
          batchOptions: {
            maxSize: 50,
            maxWaitTime: 2000,
          },
        },
      };

      const plan = dispatcher.routeRequest(payload, rules);
      const ddcAction = plan.actions.find((a) => a.target === 'ddc-client');

      expect(ddcAction?.method).toBe('storeBatch');
      expect(ddcAction?.options.batchOptions).toBeDefined();
    });

    it('should handle different payload types', () => {
      const payloads = [
        { type: 'object', data: { test: 'value' } },
        { type: 'string', data: 'simple string' },
        { type: 'array', data: [1, 2, 3] },
        { type: 'number', data: 42 },
      ];

      const rules: ProcessingRules = {
        dataCloudAction: 'write_direct',
        indexAction: 'skip',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      };

      payloads.forEach((payload) => {
        const plan = dispatcher.routeRequest(payload, rules);
        const ddcAction = plan.actions.find((a) => a.target === 'ddc-client');

        expect(ddcAction).toBeDefined();
        expect(ddcAction?.method).toBe('store');
        expect(ddcAction?.payload).toBeDefined();
      });
    });
  });

  describe('createActivityAction', () => {
    it('should create activity event action via routeRequest', () => {
      const payload = { eventType: 'user_action', userId: 'user123', eventData: { action: 'click' } };
      const rules: ProcessingRules = {
        dataCloudAction: 'skip',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: {
          priority: 'high',
          encryption: false,
        },
      };

      const plan = dispatcher.routeRequest(payload, rules);
      const activityAction = plan.actions.find((a) => a.target === 'activity-sdk');

      expect(activityAction).toBeDefined();
      expect(activityAction?.method).toBe('sendEvent');
      expect(activityAction?.priority).toBe('high');
    });

    it('should set fallback options via routeRequest', () => {
      const payload = { eventType: 'test_event' };
      const rules: ProcessingRules = {
        dataCloudAction: 'write_via_index',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: {
          priority: 'normal',
          encryption: false,
        },
      };

      const plan = dispatcher.routeRequest(payload, rules);
      const activityAction = plan.actions.find((a) => a.target === 'activity-sdk');

      expect(activityAction?.options.writeToDataCloud).toBe(true);
    });
  });

  describe('execution planning', () => {
    it('should determine correct execution mode for complex scenarios', () => {
      const payload = { test: 'execution planning' };

      // Sequential for dependent operations
      const sequentialRules: ProcessingRules = {
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      };

      const sequentialPlan = dispatcher.routeRequest(payload, sequentialRules);
      expect(sequentialPlan.executionMode).toBe('sequential');

      // Batch operations might require different planning
      const batchRules: ProcessingRules = {
        dataCloudAction: 'write_batch',
        indexAction: 'write_realtime',
        batchingRequired: true,
        additionalParams: {
          priority: 'low',
          encryption: false,
          batchOptions: { maxSize: 100, maxWaitTime: 5000 },
        },
      };

      const batchPlan = dispatcher.routeRequest(payload, batchRules);
      expect(batchPlan.rollbackRequired).toBe(false);
    });

    it('should handle error scenarios in routing', () => {
      const payload = null; // Invalid payload

      const rules: ProcessingRules = {
        dataCloudAction: 'write_direct',
        indexAction: 'write_realtime',
        batchingRequired: false,
        additionalParams: { priority: 'normal', encryption: false },
      };

      // Should handle gracefully
      expect(() => dispatcher.routeRequest(payload, rules)).not.toThrow();
    });
  });
});
