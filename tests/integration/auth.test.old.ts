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
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should fail registration with invalid email', async () => {
      const userData = TestDataFactory.createUser({
        email: 'invalid-email',
        password: 'TestPassword123!',
        name: 'Test User',
      });

      const response = await request(app)
        .post('/users/register')
        .send(userData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('email');
    });

    it('should fail registration with weak password', async () => {
      const userData = TestDataFactory.createUser({
        email: 'test@example.com',
        password: '123', // Weak password
        name: 'Test User',
      });

      const response = await request(app)
        .post('/users/register')
        .send(userData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('password');
    });

    it('should fail registration with duplicate email', async () => {
      const userData = TestDataFactory.createUser({
        email: 'duplicate@example.com',
        password: 'TestPassword123!',
        name: 'User One',
      });

      // First registration should succeed
      await request(app).post('/users/register').send(userData).set('Accept', 'application/json');

      // Second registration with same email should fail
      const duplicateData = {
        ...userData,
        name: 'User Two',
      };

      const response = await request(app)
        .post('/users/register')
        .send(duplicateData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('email');
    });
  });

  describe('POST /users/login', () => {
    let testUser: { id: number; email: string; name: string };
    let rawPassword: string;

    beforeEach(async () => {
      rawPassword = 'TestPassword123!';
      const userData = TestDataFactory.createUser({
        email: 'logintest@example.com',
        password: rawPassword,
        name: 'Login Test User',
      });

      const { user } = await AuthTestHelper.createTestUser(userData);
      testUser = user;
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: rawPassword,
      };

      const response = await request(app)
        .post('/users/login')
        .send(loginData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should fail login with incorrect password', async () => {
      const loginData = {
        email: testUser.email,
        password: 'WrongPassword123!',
      };

      const response = await request(app)
        .post('/users/login')
        .send(loginData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('credentials');
    });

    it('should fail login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123!',
      };

      const response = await request(app)
        .post('/users/login')
        .send(loginData)
        .set('Accept', 'application/json');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('credentials');
    });

    it('should fail login with missing fields', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({ email: 'test@example.com' }) // Missing password
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('password');
    });
  });

  describe('GET /users', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/users').set('Accept', 'application/json');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });

    it('should return users list for authenticated user', async () => {
      const { token } = await AuthTestHelper.createTestUserWithToken();

      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /users/:id', () => {
    let testUser: { id: number; email: string; name: string };
    let token: string;

    beforeEach(async () => {
      const result = await AuthTestHelper.createTestUserWithToken();
      testUser = result.user;
      token = result.token;
    });

    it('should get user by ID for authenticated user', async () => {
      const response = await request(app)
        .get(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUser.id);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.password).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/users/99999')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/users/${testUser.id}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(401);
    });
  });
});
