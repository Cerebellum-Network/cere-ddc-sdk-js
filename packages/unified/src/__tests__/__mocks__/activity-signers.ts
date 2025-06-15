// Enhanced Activity Signers mocks for comprehensive testing

export const UriSigner = jest.fn().mockImplementation((uri: string, options: any = {}) => ({
  sign: jest.fn().mockResolvedValue('mock_signature'),
  verify: jest.fn().mockResolvedValue(true),
  getPublicKey: jest.fn().mockReturnValue('mock_public_key'),
  address: 'mock_address',
  type: options.type || 'ed25519',
  uri,
}));

// Additional signer mocks
export const createMockSigner = (overrides: any = {}) => ({
  sign: jest.fn().mockResolvedValue('mock_signature'),
  verify: jest.fn().mockResolvedValue(true),
  getPublicKey: jest.fn().mockReturnValue('mock_public_key'),
  address: 'mock_address',
  type: 'ed25519',
  ...overrides,
});

// Error mocks for signer failures
export const SignerErrors = {
  INVALID_URI: new Error('Invalid signer URI'),
  SIGN_ERROR: new Error('Failed to sign data'),
  VERIFY_ERROR: new Error('Failed to verify signature'),
};
