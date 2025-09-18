# Express Backend Template

## 🧠 Overview

This is a robust Express.js backend template with TypeScript, featuring user management and source management modules. It includes authentication, database integration, and comprehensive API documentation.

### Environment Configuration

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual values:
   - **JWT_SECRET**: Generate a secure 32+ character secret
   - **Database**: Configure either local PostgreSQL or Supabase
   - **GROQ_API_KEY**: Get your API key from Groq
   - **AWS Configuration**: For file uploads (Supabase S3)

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### API Documentation

- Swagger UI: `http://localhost:8000/api-docs`
- OpenAPI JSON: `http://localhost:8000/api-docs.json`

#### Modular Documentation Structure

API documentation follows a modular approach with separate YAML files for each feature:

- `swagger.yaml` - Main configuration file with shared components
- `chat.yaml` - Chat API endpoints and schemas
- `users.yaml` - User management API endpoints and schemas
- `agents.yaml` - Agent configuration API endpoints and schemas
- `file-sources.yaml` - File upload/management API endpoints and schemas
- `system.yaml` - System endpoints (health checks, etc.)

To validate the API documentation structure:

```bash
npm run validate:swagger
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Authentication, validation, etc.
│   ├── routes/         # API route definitions
│   ├── database/       # Database schemas and connection
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   └── dtos/           # Data transfer objects
├── docs/
│   ├── swagger.yaml    # Main API documentation structure
│   ├── swagger.ts      # Swagger configuration
│   ├── chat.yaml       # Chat API endpoints
│   ├── users.yaml      # User API endpoints
│   ├── agents.yaml     # Agents API endpoints
│   ├── file-sources.yaml  # File sources API endpoints
│   └── system.yaml     # System API endpoints
└── build/              # Compiled JavaScript output
```

## 🛡️ Security Features

- ✅ JWT Authentication with secure token validation
- ✅ Global authentication middleware with route exemptions
- ✅ Input validation using class-validator
- ✅ Rate limiting to prevent API abuse
- ✅ CORS configured with specific origins
- ✅ Comprehensive error handling
- ✅ SQL injection protection
- ✅ Environment variable validation
- ✅ **Encrypted API Key Storage** - API keys are encrypted with salt before database storage
- ✅ **Centralized Audit Fields** - All audit information tracked in main tables for better performance

## 🗄️ Database Architecture

### Normalized Database Design

The database follows a normalized structure with the following key features:

#### Core Tables

- **users** - User accounts and authentication
- **provider_models** - Available AI provider/model combinations
- **agents** - AI agent configurations with encrypted API keys
- **chat_sessions** - Chat conversation sessions
- **sources** - Knowledge sources with centralized audit fields and processing status
- **messages** - Individual chat messages

#### Source Type Tables (Lightweight)

- **file_sources** - File-based knowledge sources
- **text_sources** - Text-based knowledge sources
- **website_sources** - Web scraping sources
- **database_sources** - Database connection sources
- **qa_sources** - Question/Answer pair sources

#### Key Normalization Benefits

1. **API Key Security**: Encrypted storage with individual salts
2. **Centralized Audit**: All audit fields in main `sources` table for better queries
3. **Status Tracking**: Processing status and metadata for all sources
4. **Performance**: Optimized with proper indexes and foreign key relationships

#### Migration and Seeds

- Use `npm run migrate` to set up database schema
- Use `npm run migrate:drop` to reset and recreate all tables
- Seeds included for development data

## � API Endpoints

### Authentication (Public)

- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login

### User Management (Protected)

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Chat (Protected)

- `POST /api/v1/chat` - Send chat message

### System

- `GET /health` - Health check endpoint

## � Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Database

The application supports both local PostgreSQL and Supabase. Configure your preferred option in the `.env` file.

### Logging

Logs are written to `src/logs/` directory with different files for different log levels.

---

## 📋 Security & Issues

For detailed security analysis and resolved issues, see [issues.md](./issues.md).

**Current Status**: ✅ Production Ready - All security vulnerabilities have been addressed.
