import request from 'supertest';
import { Application } from 'express';
import App from '../../src/app';
import UserRoute from '../../src/features/user/user.route';
import { dbHelper } from '../utils/database.helper';
import { AuthTestHelper } from '../utils/auth.helper';
import { TestDataFactory } from '../utils/factories';

describe('User Authentication Integration Tests', () => {
  let app: Application;
  let appInstance: App;

  beforeAll(async () => {
    // Initialize the app for testing with user routes
    const userRoute = new UserRoute();
    appInstance = new App([userRoute]);
    app = appInstance.getServer();
  });

  beforeEach(async () => {
    // Clean database before each test
    await dbHelper.cleanup();
    await dbHelper.resetSequences();
  });

  afterAll(async () => {
    // Close database connection
    await dbHelper.close();
  });

  describe('POST /api/v1/users/register', () => {
    it('should register a new user successfully', async () => {
      const userData = TestDataFactory.createUser({
        email: 'newuser@example.com',
        password: 'TestPassword123!',
        name: 'New User',
      });

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(userData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.password).toBeUndefined(); // Password should not be returned
      expect(response.body.message).toBe('User registered successfully');
    });

    it('should fail registration with invalid email', async () => {
      const userData = TestDataFactory.createUser({
        email: 'invalid-email',
        password: 'TestPassword123!',
        name: 'Test User',
      });

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(userData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('email');
    });

    it('should fail registration with weak password', async () => {
      const userData = TestDataFactory.createUser({
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User',
      });

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(userData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('password');
    });

    it('should fail registration with duplicate email', async () => {
      const userData = TestDataFactory.createUser({
        email: 'duplicate@example.com',
        password: 'TestPassword123!',
        name: 'First User',
      });

      // First registration should succeed
      await request(app)
        .post('/api/v1/users/register')
        .send(userData)
        .set('Accept', 'application/json');

      // Second registration with same email should fail
      const duplicateUserData = TestDataFactory.createUser({
        email: 'duplicate@example.com',
        password: 'TestPassword123!',
        name: 'Second User',
      });

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(duplicateUserData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(409);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('Email already registered');
    });
  });

  describe('POST /api/v1/users/login', () => {
    it('should login successfully with correct credentials', async () => {
      // Create a test user first
      const userData = TestDataFactory.createUser({
        email: 'logintest@example.com',
        password: 'TestPassword123!',
        name: 'Login Test User',
      });

      await request(app)
        .post('/api/v1/users/register')
        .send(userData)
        .set('Accept', 'application/json');

      // Now test login
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.password).toBeUndefined();
      expect(response.body.message).toBe('Login successful');
    });

    it('should fail login with incorrect password', async () => {
      const { user } = await AuthTestHelper.createTestUserWithToken();

      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: user.email,
          password: 'wrongpassword',
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('Incorrect password');
    });

    it('should fail login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!',
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('Email not registered');
    });

    it('should fail login with missing fields', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({ email: 'test@example.com' }) // Missing password
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/users', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/users').set('Accept', 'application/json');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('Authentication token missing');
    });

    it('should return users list for authenticated user', async () => {
      const { token } = await AuthTestHelper.createTestUserWithToken();

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.message).toBe('Users retrieved successfully');
    });
  });

  describe('GET /api/v1/users/:id', () => {
    let testUser: { id: number; email: string; name: string };
    let token: string;

    beforeEach(async () => {
      const result = await AuthTestHelper.createTestUserWithToken();
      testUser = result.user;
      token = result.token;
    });

    it('should get user by ID for authenticated user', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(testUser.id);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.password).toBeUndefined();
      expect(response.body.message).toBe('User retrieved successfully');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/v1/users/99999')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('User not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${testUser.id}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('Authentication token missing');
    });
  });
});
