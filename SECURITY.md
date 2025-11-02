# Security Policy

## Secret Management

### Environment Variables

This project uses environment variables for sensitive configuration. Follow these guidelines:

#### ✅ Best Practices

1. **Never commit secrets to version control**
   - The `.env` file is in `.gitignore` and should never be committed
   - Use `.env.example` as a template with placeholder values only

2. **Required Environment Variables**
   - `JWT_SECRET`: Minimum 32 characters for security (validated at runtime)
   - `DATABASE_URL`: PostgreSQL connection string
   - `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`: AWS S3 credentials
   - `REDIS_PASSWORD`: Redis authentication (optional)
   - `EMAIL_USER`, `EMAIL_PASSWORD`: Email service credentials

3. **Docker Compose Security**
   - `compose.yaml` references `.env` via the `env_file` directive
   - For production, consider using Docker secrets or a secure secret management solution
   - See comments in `compose.yaml` for additional security guidance

4. **Test Environment**
   - Test helpers use fallback secrets (e.g., `test-jwt-secret`) for testing only
   - These fallback values are clearly documented and should never be used in production
   - Production code in `src/` enforces proper environment variable validation

#### ⚠️ Security Checks Performed

- ✅ No hardcoded secrets found in `compose.yaml`
- ✅ `.env` file is properly excluded via `.gitignore`
- ✅ No actual secrets found in git history
- ✅ `.env.example` contains only placeholder values
- ✅ Test helpers document fallback secrets as test-only
- ✅ Production code validates required environment variables

### Reporting Security Issues

If you discover a security vulnerability, please email the maintainers directly rather than creating a public issue.

## Security Features

This application includes:

- JWT-based authentication with role-based access control
- Password hashing with bcrypt (12 rounds)
- Rate limiting to prevent abuse
- CORS configuration
- Input validation with Zod schemas
- Helmet.js for security headers
- HPP protection against HTTP Parameter Pollution

## Dependencies

- Run `npm audit` regularly to check for vulnerabilities
- Keep dependencies up to date
- Review dependency changes before upgrading

## Production Deployment Checklist

- [ ] Generate a strong, unique `JWT_SECRET` (minimum 32 characters)
- [ ] Use secure database credentials
- [ ] Enable SSL/TLS for all connections
- [ ] Configure appropriate CORS origins
- [ ] Set up proper logging and monitoring
- [ ] Use environment-specific `.env` files
- [ ] Never commit `.env` files to version control
- [ ] Consider using a secret management service (AWS Secrets Manager, HashiCorp Vault, etc.)
- [ ] Review and update security headers
- [ ] Configure rate limiting appropriately
- [ ] Enable database connection encryption
- [ ] Set up automated security scanning
