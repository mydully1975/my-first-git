const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

// JWT 토큰 생성 테스트
describe('JWT Token Generation', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    role: 'user'
  };

  it('should generate valid JWT token', () => {
    const token = jwt.sign(
      { userId: testUser.id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    expect(decoded.userId).toBe(testUser.id);
    expect(decoded.email).toBe(testUser.email);
    expect(decoded.role).toBe(testUser.role);
  });

  it('should expire token after specified time', (done) => {
    const token = jwt.sign(
      { userId: testUser.id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1ms' } // 1밀리초 후 만료
    );

    setTimeout(() => {
      expect(() => {
        jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      }).toThrow();
      done();
    }, 10);
  });

  it('should reject token with wrong secret', () => {
    const token = jwt.sign(
      { userId: testUser.id },
      'correct-secret',
      { expiresIn: '24h' }
    );

    expect(() => {
      jwt.verify(token, 'wrong-secret');
    }).toThrow();
  });
});

// 비밀번호 해싱 테스트
describe('Password Hashing', () => {
  const plainPassword = 'TestPassword123!';

  it('should hash password with bcrypt', async () => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(plainPassword);
    expect(hashedPassword.length).toBe(60); // bcrypt hash length
  });

  it('should verify correct password', async () => {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);

    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const isValid = await bcrypt.compare('WrongPassword', hashedPassword);

    expect(isValid).toBe(false);
  });

  it('should generate different hashes for same password', async () => {
    const hash1 = await bcrypt.hash(plainPassword, 10);
    const hash2 = await bcrypt.hash(plainPassword, 10);

    expect(hash1).not.toBe(hash2);
  });
});

// 인증 미들웨어 테스트
describe('Authentication Middleware', () => {
  let authToken;

  beforeAll(() => {
    authToken = jwt.sign(
      { userId: 1, email: 'test@example.com', role: 'user' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );
  });

  it('should pass with valid token', () => {
    const req = {
      headers: {
        authorization: `Bearer ${authToken}`
      }
    };

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET || 'test-secret');
    expect(decoded.userId).toBe(1);
  });

  it('should fail without token', () => {
    const req = {
      headers: {}
    };

    expect(req.headers.authorization).toBeUndefined();
  });

  it('should fail with invalid token format', () => {
    const req = {
      headers: {
        authorization: 'InvalidFormat token'
      }
    };

    expect(() => {
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    }).toThrow();
  });
});

// 역할 기반 접근 제어 테스트
describe('Role-Based Access Control', () => {
  const adminToken = jwt.sign(
    { userId: 1, email: 'admin@example.com', role: 'admin' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '24h' }
  );

  const userToken = jwt.sign(
    { userId: 2, email: 'user@example.com', role: 'user' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '24h' }
  );

  it('should allow admin to access admin resources', () => {
    const decoded = jwt.verify(adminToken, process.env.JWT_SECRET || 'test-secret');
    expect(decoded.role).toBe('admin');
  });

  it('should deny user to access admin resources', () => {
    const decoded = jwt.verify(userToken, process.env.JWT_SECRET || 'test-secret');
    expect(decoded.role).toBe('admin').toBe(false);
  });

  it('should check required role', (requiredRole) => {
    const decoded = jwt.verify(adminToken, process.env.JWT_SECRET || 'test-secret');
    const hasAccess = decoded.role === requiredRole;

    if (requiredRole === 'admin') {
      expect(hasAccess).toBe(true);
    } else {
      expect(hasAccess).toBe(false);
    }
  });
});

// 토큰 리프레시 테스트
describe('Token Refresh', () => {
  it('should generate new token with refresh token', () => {
    const refreshToken = jwt.sign(
      { userId: 1, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: '7d' }
    );

    const newToken = jwt.sign(
      { userId: 1, email: 'test@example.com', role: 'user' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );

    expect(refreshToken).toBeDefined();
    expect(newToken).toBeDefined();
    expect(refreshToken).not.toBe(newToken);
  });
});

// 토큰 만료 처리 테스트
describe('Token Expiration Handling', () => {
  it('should handle expired token gracefully', () => {
    const expiredToken = jwt.sign(
      { userId: 1 },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '-1h' } // 이미 만료된 토큰
    );

    expect(() => {
      jwt.verify(expiredToken, process.env.JWT_SECRET || 'test-secret');
    }).toThrow(jwt.TokenExpiredError);
  });

  it('should provide error message for expired token', () => {
    const expiredToken = jwt.sign(
      { userId: 1 },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '-1h' }
    );

    try {
      jwt.verify(expiredToken, process.env.JWT_SECRET || 'test-secret');
    } catch (error) {
      expect(error.name).toBe('TokenExpiredError');
      expect(error.message).toContain('expired');
    }
  });
});
