export const seeds = {
  users: [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: '$2b$10$K.0HwpsoPDGaB/atFBmmXOGTw4cGGV.wNZOngx6UgVL5TPiVVwx6G', // hashed "password123"
      phone_number: '+1234567890',
      created_by: 1,
      updated_by: 1,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: '$2b$10$K.0HwpsoPDGaB/atFBmmXOGTw4cGGV.wNZOngx6UgVL5TPiVVwx6G',
      created_by: 1,
    },
  ],

  sources: [
    {
      id: 1,
      user_id: 1,
      source_type: 'file',
      name: 'documentation.pdf',
      description: 'Product documentation PDF file.',
      status: 'completed',
      is_embedded: true,
      created_by: 1,
    },
    {
      id: 2,
      user_id: 1,
      source_type: 'text',
      name: 'Training Example Text',
      description: 'Example text source for training.',
      status: 'completed',
      is_embedded: true,
      created_by: 1,
    },
  ],

  fileSources: [
    {
      source_id: 1,
      file_url: 'https://storage.example.com/docs/documentation.pdf',
      mime_type: 'application/pdf',
      file_size: 1024576, // 1MB
    },
    {
      source_id: 1,
      file_url: 'https://storage.example.com/docs/user-guide.docx',
      mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      file_size: 512000, // 500KB
    },
  ],

  textSources: [
    {
      source_id: 2,
      content: 'This is an example of a text source that can be used for training or reference.',
    },
    {
      source_id: 2,
      content: 'Another example text source with different content for variety in training data.',
    },
  ],
};
