import { Dispatcher } from '../Dispatcher';
import { ProcessingRules } from '../RulesInterpreter';

describe('Dispatcher', () => {
  let dispatcher: Dispatcher;
  let mockLogger: jest.Mock;

  beforeEach(() => {
    mockLogger = jest.fn();
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
      expect(activityAction?.payload.type).toBe('telegram.event');
      expect(activityAction?.payload.userId).toBe('user123');
    });

    it('should set fallback options via routeRequest', () => {
      const payload = { eventType: 'test' };
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
});
