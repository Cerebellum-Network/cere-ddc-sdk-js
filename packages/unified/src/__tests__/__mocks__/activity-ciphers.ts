// Enhanced Activity Ciphers mocks for comprehensive testing

export const NoOpCipher = jest.fn().mockImplementation(() => ({
  encrypt: jest.fn().mockImplementation((data: any) => Promise.resolve(data)),
  decrypt: jest.fn().mockImplementation((data: any) => Promise.resolve(data)),
  encryptString: jest.fn().mockImplementation((str: string) => Promise.resolve(str)),
  decryptString: jest.fn().mockImplementation((str: string) => Promise.resolve(str)),
  isEncrypted: jest.fn().mockReturnValue(false),
}));

// Mock for actual encryption cipher
export const AESCipher = jest.fn().mockImplementation((key: string) => ({
  encrypt: jest.fn().mockImplementation((data: any) => Promise.resolve(`encrypted_${JSON.stringify(data)}`)),
  decrypt: jest.fn().mockImplementation((data: string) => {
    const cleanData = data.replace('encrypted_', '');
    return Promise.resolve(JSON.parse(cleanData));
  }),
  encryptString: jest.fn().mockImplementation((str: string) => Promise.resolve(`encrypted_${str}`)),
  decryptString: jest.fn().mockImplementation((str: string) => Promise.resolve(str.replace('encrypted_', ''))),
  isEncrypted: jest.fn().mockReturnValue(true),
  key,
}));

// Additional cipher utilities
export const createMockCipher = (encrypted: boolean = false) => ({
  encrypt: jest
    .fn()
    .mockImplementation((data: any) => Promise.resolve(encrypted ? `encrypted_${JSON.stringify(data)}` : data)),
  decrypt: jest
    .fn()
    .mockImplementation((data: any) =>
      Promise.resolve(
        encrypted && typeof data === 'string' && data.startsWith('encrypted_')
          ? JSON.parse(data.replace('encrypted_', ''))
          : data,
      ),
    ),
  encryptString: jest.fn().mockImplementation((str: string) => Promise.resolve(encrypted ? `encrypted_${str}` : str)),
  decryptString: jest
    .fn()
    .mockImplementation((str: string) =>
      Promise.resolve(encrypted && str.startsWith('encrypted_') ? str.replace('encrypted_', '') : str),
    ),
  isEncrypted: jest.fn().mockReturnValue(encrypted),
});

// Error mocks for cipher failures
export const CipherErrors = {
  ENCRYPTION_ERROR: new Error('Failed to encrypt data'),
  DECRYPTION_ERROR: new Error('Failed to decrypt data'),
  INVALID_KEY: new Error('Invalid cipher key'),
};
