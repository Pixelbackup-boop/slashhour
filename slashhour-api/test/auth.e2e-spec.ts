import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Authentication (E2E)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same pipes as main app
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prismaService = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const uniqueUsername = `testuser-${Date.now()}`;

    it('should register a new consumer user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: uniqueEmail,
          username: uniqueUsername,
          password: 'password123',
          userType: 'consumer',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe(uniqueEmail.toLowerCase());
          expect(res.body.user.userType).toBe('consumer');
        });
    });

    it('should register a new business user', () => {
      const businessEmail = `business-${Date.now()}@example.com`;
      const businessUsername = `business-${Date.now()}`;

      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Business Owner',
          email: businessEmail,
          username: businessUsername,
          password: 'password123',
          userType: 'business',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user.userType).toBe('business');
        });
    });

    it('should normalize email to lowercase', () => {
      const mixedCaseEmail = `Test-${Date.now()}@EXAMPLE.COM`;
      const lowercaseUsername = `lowercase-${Date.now()}`;

      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: mixedCaseEmail,
          username: lowercaseUsername,
          password: 'password123',
          userType: 'consumer',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user.email).toBe(mixedCaseEmail.toLowerCase());
        });
    });

    it('should reject duplicate email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Duplicate User',
          email: uniqueEmail,
          username: `unique-${Date.now()}`,
          password: 'password123',
          userType: 'consumer',
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should reject duplicate username', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Duplicate User',
          email: `unique-${Date.now()}@example.com`,
          username: uniqueUsername,
          password: 'password123',
          userType: 'consumer',
        })
        .expect(409);
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          username: `user-${Date.now()}`,
          password: 'password123',
          userType: 'consumer',
        })
        .expect(400);
    });

    it('should reject short password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: `test-${Date.now()}@example.com`,
          username: `user-${Date.now()}`,
          password: 'short',
          userType: 'consumer',
        })
        .expect(400);
    });

    it('should reject missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          // Missing email, username, password
          userType: 'consumer',
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    const testEmail = `login-test-${Date.now()}@example.com`;
    const testUsername = `logintest-${Date.now()}`;
    const testPassword = 'password123';

    beforeAll(async () => {
      // Create a test user for login tests
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Login Test User',
          email: testEmail,
          username: testUsername,
          password: testPassword,
          userType: 'consumer',
        });
    });

    it('should login with email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          emailOrPhone: testEmail,
          password: testPassword,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe(testEmail.toLowerCase());
        });
    });

    it('should login with username', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          emailOrPhone: testUsername,
          password: testPassword,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.user.username).toBe(testUsername);
        });
    });

    it('should login with case-insensitive email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          emailOrPhone: testEmail.toUpperCase(),
          password: testPassword,
        })
        .expect(200);
    });

    it('should reject invalid password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          emailOrPhone: testEmail,
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should reject non-existent user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          emailOrPhone: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should reject missing credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          emailOrPhone: testEmail,
          // Missing password
        })
        .expect(400);
    });
  });

  describe('/auth/refresh (POST)', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Refresh Test User',
          email: `refresh-${Date.now()}@example.com`,
          username: `refreshtest-${Date.now()}`,
          password: 'password123',
          userType: 'consumer',
        });

      refreshToken = response.body.refreshToken;
    });

    it('should refresh access token with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should reject invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);
    });

    it('should reject missing refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('/auth/me (GET)', () => {
    let accessToken: string;
    let userEmail: string;

    beforeAll(async () => {
      userEmail = `me-test-${Date.now()}@example.com`;
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Me Test User',
          email: userEmail,
          username: `metest-${Date.now()}`,
          password: 'password123',
          userType: 'consumer',
        });

      accessToken = response.body.accessToken;
    });

    it('should return current user with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(userEmail.toLowerCase());
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Complete Auth Flow (E2E)', () => {
    it('should complete full registration → login → refresh → access protected route', async () => {
      const uniqueEmail = `flow-${Date.now()}@example.com`;
      const uniqueUsername = `flow-${Date.now()}`;
      const password = 'password123';

      // Step 1: Register
      const registerRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'Flow Test User',
          email: uniqueEmail,
          username: uniqueUsername,
          password,
          userType: 'consumer',
        })
        .expect(201);

      const { accessToken: initialAccessToken, refreshToken } = registerRes.body;
      expect(initialAccessToken).toBeDefined();
      expect(refreshToken).toBeDefined();

      // Step 2: Access protected route with access token
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${initialAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(uniqueEmail.toLowerCase());
        });

      // Step 3: Refresh token
      const refreshRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      const { accessToken: newAccessToken } = refreshRes.body;
      expect(newAccessToken).toBeDefined();
      expect(newAccessToken).not.toBe(initialAccessToken);

      // Step 4: Access protected route with new token
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      // Step 5: Login with credentials
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          emailOrPhone: uniqueEmail,
          password,
        })
        .expect(200);

      expect(loginRes.body.accessToken).toBeDefined();

      // Step 6: Access protected route with login token
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
        .expect(200);
    });
  });
});
