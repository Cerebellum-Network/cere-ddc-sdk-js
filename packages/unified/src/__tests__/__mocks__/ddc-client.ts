// Enhanced DDC Client mocks for comprehensive testing

export const DdcClient = {
  create: jest.fn().mockResolvedValue({
    store: jest.fn().mockResolvedValue({ toString: () => '0xabc123' }),
    storeBatch: jest.fn().mockResolvedValue([{ toString: () => '0xabc123' }, { toString: () => '0xdef456' }]),
    read: jest.fn().mockResolvedValue(Buffer.from('test data')),
    disconnect: jest.fn().mockResolvedValue(undefined),
    getBucketInfo: jest.fn().mockResolvedValue({
      bucketId: BigInt(12345),
      clusterId: BigInt(1),
      ownerId: 'test-owner',
    }),
  }),
};

// Mock DagNode for file operations
export const DagNode = jest.fn().mockImplementation((data: any) => ({
  data,
  cid: { toString: () => '0xmock_cid' },
  size: data?.length || 0,
}));

// Mock File for file uploads
export const File = jest.fn().mockImplementation((path: string, content: any) => ({
  path,
  content,
  size: content?.length || 0,
  type: 'file',
  cid: { toString: () => '0xfile_cid' },
}));

// Additional DDC-related mocks
export const createMockCid = (id: string = 'mock') => ({
  toString: () => `0x${id}_cid`,
  toV0: () => ({ toString: () => `0x${id}_cid_v0` }),
  toV1: () => ({ toString: () => `0x${id}_cid_v1` }),
});

// Error mocks for testing failure scenarios
export const DDCErrors = {
  CONNECTION_ERROR: new Error('Failed to connect to DDC network'),
  STORAGE_ERROR: new Error('Failed to store data in DDC'),
  BUCKET_ERROR: new Error('Bucket not found or access denied'),
  TIMEOUT_ERROR: new Error('DDC operation timed out'),
};
