export class MockServices {
  // Mock Redis client
  static mockRedisClient = {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue('OK'),
    disconnect: jest.fn().mockResolvedValue(undefined),
  };

  // Mock AWS S3 client
  static mockS3Client = {
    send: jest.fn().mockResolvedValue({
      Location: 'https://test-bucket.s3.amazonaws.com/test-file.txt',
      Key: 'test-file.txt',
    }),
  };

  // Mock email service
  static mockEmailService = {
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id',
      response: '250 Message accepted',
    }),
  };

  // Mock external API calls
  static mockAxios = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };

  static resetAllMocks(): void {
    jest.clearAllMocks();

    // Reset Redis mocks
    Object.values(this.mockRedisClient).forEach(mock => {
      if (jest.isMockFunction(mock)) {
        mock.mockReset();
      }
    });

    // Reset S3 mocks
    this.mockS3Client.send.mockReset();

    // Reset email mocks
    this.mockEmailService.sendMail.mockReset();

    // Reset axios mocks
    Object.values(this.mockAxios).forEach(mock => {
      if (jest.isMockFunction(mock)) {
        mock.mockReset();
      }
    });
  }

  static setupDefaultMocks(): void {
    // Setup default successful responses
    this.mockRedisClient.set.mockResolvedValue('OK');
    this.mockRedisClient.get.mockResolvedValue(null);
    this.mockRedisClient.ping.mockResolvedValue('PONG');

    this.mockS3Client.send.mockResolvedValue({
      Location: 'https://test-bucket.s3.amazonaws.com/test-file.txt',
    });

    this.mockEmailService.sendMail.mockResolvedValue({
      messageId: 'test-message-id',
    });
  }
}
