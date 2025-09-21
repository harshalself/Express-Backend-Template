import request from 'supertest';
import { Express } from 'express';

export class ApiTestHelper {
  private app: Express;

  constructor(app: Express) {
    this.app = app;
  }

  // Helper for authenticated requests
  async authenticatedRequest(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    token: string
  ) {
    const req = request(this.app);
    return req[method](path)
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
  }

  // Helper for GET requests
  async get(path: string, token?: string) {
    const req = request(this.app).get(path).set('Accept', 'application/json');
    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }
    return req;
  }

  // Helper for POST requests
  async post(path: string, data: Record<string, unknown>, token?: string) {
    const req = request(this.app)
      .post(path)
      .send(data)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }
    return req;
  }

  // Helper for PUT requests
  async put(path: string, data: Record<string, unknown>, token?: string) {
    const req = request(this.app)
      .put(path)
      .send(data)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }
    return req;
  }

  // Helper for DELETE requests
  async delete(path: string, token?: string) {
    const req = request(this.app).delete(path).set('Accept', 'application/json');
    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }
    return req;
  }

  // Helper for file upload requests
  async uploadFile(path: string, fieldName: string, filePath: string, token?: string) {
    const req = request(this.app)
      .post(path)
      .attach(fieldName, filePath)
      .set('Accept', 'application/json');

    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    }
    return req;
  }

  // Helper to expect error response
  expectError(response: request.Response, statusCode: number, message?: string) {
    expect(response.status).toBe(statusCode);
    expect(response.body).toHaveProperty('error');
    if (message) {
      expect(response.body.error).toContain(message);
    }
  }

  // Helper to expect success response
  expectSuccess(response: request.Response, statusCode: number = 200) {
    expect(response.status).toBe(statusCode);
    expect(response.body).toHaveProperty('success', true);
  }
}
