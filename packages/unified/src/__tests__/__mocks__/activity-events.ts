// Enhanced Activity Events mocks for comprehensive testing

export const EventDispatcher = jest.fn().mockImplementation(() => ({
  dispatchEvent: jest.fn().mockResolvedValue({
    eventId: 'evt_123',
    status: 'indexed',
    timestamp: new Date(),
  }),
  dispatchBatchEvents: jest.fn().mockResolvedValue([
    { eventId: 'evt_123', status: 'indexed' },
    { eventId: 'evt_124', status: 'indexed' },
  ]),
  getEventStatus: jest.fn().mockResolvedValue({ status: 'indexed', timestamp: new Date() }),
}));

export const ActivityEvent = jest.fn().mockImplementation((type: string, data: any) => ({
  type,
  data,
  timestamp: new Date(),
  eventId: `evt_${Math.random().toString(36).substring(2, 9)}`,
}));

// Additional activity-related mocks
export const createMockActivityEvent = (overrides: any = {}) => ({
  eventId: 'evt_mock',
  eventType: 'test_event',
  userId: 'user123',
  timestamp: new Date(),
  payload: { test: 'data' },
  ...overrides,
});

// Error mocks for activity service failures
export const ActivityErrors = {
  INDEXING_ERROR: new Error('Failed to index event'),
  VALIDATION_ERROR: new Error('Event validation failed'),
  NETWORK_ERROR: new Error('Activity service network error'),
  RATE_LIMIT_ERROR: new Error('Activity service rate limit exceeded'),
};
