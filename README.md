# Express Backend Template

A robust Express.js backend template with TypeScript, featuring user authentication and source management with file/text content handling.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

## 📋 Features

- **User Management**: Registration, login, JWT authentication
- **File Sources**: Upload and manage PDF, DOC, DOCX, TXT files with text extraction
- **Text Sources**: Store and manage plain text content
- **PostgreSQL Database**: Normalized schema with proper relationships
- **AWS S3 Integration**: Secure file storage and management
- **Security**: Rate limiting, CORS, input validation, encryption
- **API Documentation**: Complete Swagger/OpenAPI documentation
- **Testing**: Jest with unit and integration tests
- **Logging**: Winston with structured logging

## 🗂️ API Endpoints

### Authentication (Public)

- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login

### User Management (Protected)

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Source Management (Protected)

#### Base Sources

- `GET /api/v1/sources/agent/:agentId` - Get all sources for an agent
- `POST /api/v1/sources/agent/:agentId` - Create new source
- `GET /api/v1/sources/:id` - Get source by ID
- `PUT /api/v1/sources/:id` - Update source
- `DELETE /api/v1/sources/:id` - Delete source

#### File Sources

- `POST /api/v1/sources/file` - Upload single file
- `POST /api/v1/sources/file/multiple` - Upload multiple files
- `GET /api/v1/sources/file/agent/:agentId` - Get file sources for agent
- `GET /api/v1/sources/file/:id` - Get file source by ID
- `PUT /api/v1/sources/file/:id` - Update file source
- `DELETE /api/v1/sources/file/:id` - Delete file source

#### Text Sources

- `POST /api/v1/sources/text` - Create text source
- `GET /api/v1/sources/text/agent/:agentId` - Get text sources for agent
- `GET /api/v1/sources/text/:id` - Get text source by ID
- `PUT /api/v1/sources/text/:id` - Update text source

### System

- `GET /health` - Health check

## 🗄️ Database Schema

```
users (id, name, email, password, phone_number, audit_fields)
sources (id, user_id, source_type, name, description, status, audit_fields)
file_sources (id, source_id, file_url, mime_type, file_size, text_content)
text_sources (id, source_id, content)
```

## ⚙️ Environment Setup

Create `.env` file with:

```bash
# Server
PORT=8000
JWT_SECRET=your-secure-jwt-secret

# Database
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=your-db-name

# AWS S3 (for file uploads)
AWS_ACCESS_KEY=your-aws-access-key
AWS_SECRET_KEY=your-aws-secret-key
AWS_BUCKET_NAME=your-bucket-name
AWS_REGION=your-region
AWS_ENDPOINT=https://your-project.supabase.co/storage/v1/s3

# Email (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## 🏗️ Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts             # Server bootstrap
├── config/               # Environment configurations
├── features/
│   ├── user/            # User management
│   └── source/          # Source management
│       ├── file/        # File upload handling
│       └── text/        # Text content handling
├── middlewares/          # Authentication, validation, security
├── utils/               # Helpers, services, utilities
├── interfaces/          # TypeScript interfaces
├── routes/              # Route definitions
└── database/            # Database schemas and migrations

docs/                    # Swagger documentation
tests/                   # Unit and integration tests
```

## �️ Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm start               # Start production server

# Database
npm run migrate         # Run database migrations

# Testing
npm test                # Run all tests
npm run test:unit       # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:coverage   # Run tests with coverage

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting issues

# Documentation
npm run validate:swagger # Validate API documentation
```

## 📚 API Documentation

Access Swagger UI at: `http://localhost:8000/api-docs`

The API documentation is modular and organized by feature:

- User management endpoints
- File source management
- Text source management
- System endpoints

## 🔒 Security Features

- JWT authentication with secure token validation
- Password hashing with bcrypt
- Rate limiting on authentication endpoints
- Input validation with Zod schemas
- CORS configuration
- Helmet security headers
- SQL injection protection
- File upload validation and size limits

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests**: Individual functions and utilities
- **Integration Tests**: API endpoints with database
- **Test Coverage**: Jest coverage reporting
- **Pre-commit Hooks**: Automated testing on commits

## 📝 File Processing

Supports multiple file formats with automatic text extraction:

- **PDF**: Text extraction using pdf-parse
- **DOC/DOCX**: Text extraction using mammoth
- **TXT**: Direct text reading
- **Images**: QR code and barcode reading support

## 🚀 Production Deployment

1. Build the application: `npm run build`
2. Set environment variables for production
3. Run database migrations
4. Start the server: `npm start`

## � License

ISC License - see package.json for details.
