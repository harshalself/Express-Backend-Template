# Express Backend Template

A robust, production-ready Express.js backend with TypeScript, featuring user authentication, file/text content management, and modern tooling.

## 🚀 Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

## 📋 Features

- **Authentication**: JWT-based user registration/login
- **File Management**: PDF, DOC, DOCX, TXT upload with text extraction
- **Text Content**: CRUD operations for plain text sources
- **Database**: PostgreSQL with Knex.js migrations
- **Storage**: AWS S3 compatible (Supabase)
- **Caching**: Optional Redis integration
- **Security**: Rate limiting, CORS, input validation, helmet
- **Documentation**: Modular Swagger/OpenAPI 3.0
- **Testing**: Jest with unit/integration tests
- **Docker**: Multi-stage builds for dev/prod

## 🗂️ API Endpoints

### Public

- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login

### Protected

- `GET /api/v1/users` - List users
- `GET /api/v1/sources/agent/:agentId` - Get sources
- `POST /api/v1/sources/file` - Upload files
- `POST /api/v1/sources/text` - Create text sources

### System

- `GET /health` - Health check

## 🗄️ Database Schema

```sql
users (id, name, email, password, phone_number, audit_fields)
sources (id, user_id, source_type, name, status, is_embedded, audit_fields)
file_sources (id, source_id, file_url, mime_type, text_content, audit_fields)
text_sources (id, source_id, content, audit_fields)
```

**Features**: Audit fields, soft deletes, referential integrity, embedding support.

## ⚙️ Environment Setup

Create `.env` with:

```bash
JWT_SECRET=your-256-bit-secret
PORT=8000
DB_HOST=postgres-host
DB_USER=db-user
DB_PASSWORD=db-password
DB_DATABASE=db-name
REDIS_HOST=redis-host (optional)
AWS_ACCESS_KEY=key
AWS_SECRET_KEY=secret
AWS_BUCKET_NAME=bucket
```

**Files**: `.env` (dev), `.env.prod` (prod), `.env.example` (template)

## 🏗️ Project Structure

```
src/
├── app.ts, server.ts     # App setup and bootstrap
├── features/             # User and source management
├── middlewares/          # Auth, validation, security
├── utils/               # Logger, redis, email, validation
├── interfaces/          # TypeScript definitions
└── routes/              # Route definitions

database/                # Schemas and migrations
docs/                    # Swagger documentation
tests/                   # Unit and integration tests
scripts/                 # Utility scripts
```

## 🛠️ Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start               # Start production server

# Database
npx ts-node database/migrate.schema.ts  # Run migrations

# Testing
npm test                # Run all tests
npm run test:coverage   # With coverage

# Quality
npm run lint            # Lint code
npm run validate:swagger # Validate docs
```

## Deployment

### Docker

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### Production Checklist

- [ ] Configure `.env.prod`
- [ ] Run database migrations
- [ ] Setup SSL certificates
- [ ] Configure monitoring

## 🔧 Tech Stack

- **Runtime**: Node.js 18+, Express 5.x, TypeScript 5.7+
- **Database**: PostgreSQL + Knex.js
- **Auth**: JWT + bcrypt
- **Validation**: Zod schemas
- **Storage**: AWS S3 SDK v3
- **Testing**: Jest + SWC + V8 coverage
- **Linting**: ESLint 9 + Prettier 3
- **Docker**: Multi-stage Alpine builds

## � Documentation

Interactive API docs at: `http://localhost:8000/api-docs`

---

**Built with ❤️ for modern Node.js development**
