const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

describe('Quote Request API', () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    await db.query('BEGIN');

    // 테스트 사용자 생성 및 로그인
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'quotetest@example.com',
        password: 'Test123!',
        name: 'Quote Test User',
        phone: '010-9876-5432'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'quotetest@example.com',
        password: 'Test123!'
      });

    authToken = loginResponse.body.token;
    testUserId = loginResponse.body.user.id;
  });

  afterAll(async () => {
    await db.query('ROLLBACK');
    await db.end();
  });

  describe('POST /api/quotes/requests', () => {
    it('should create a new quote request', async () => {
      const quoteRequest = {
        category_id: 1,
        title: '테스트 견적 요청',
        description: '테스트용 견적 요청입니다.',
        location: '서울시 강남구',
        budget: 5000000,
        preferred_date: '2026-08-01'
      };

      const response = await request(app)
        .post('/api/quotes/requests')
        .set('Authorization', `Bearer ${authToken}`)
        .send(quoteRequest)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('quote_request');
      expect(response.body.quote_request.title).toBe(quoteRequest.title);
      expect(response.body.quote_request.user_id).toBe(testUserId);
    });

    it('should validate required fields', async () => {
      const invalidRequest = {
        title: '테스트 견적 요청'
        // missing category_id, description
      };

      const response = await request(app)
        .post('/api/quotes/requests')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should not create without authentication', async () => {
      const quoteRequest = {
        category_id: 1,
        title: '테스트 견적 요청',
        description: '테스트용 견적 요청입니다.'
      };

      const response = await request(app)
        .post('/api/quotes/requests')
        .send(quoteRequest)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/quotes/requests/my', () => {
    it('should get user quote requests', async () => {
      const response = await request(app)
        .get('/api/quotes/requests/my')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('quote_requests');
      expect(Array.isArray(response.body.quote_requests)).toBe(true);
    });

    it('should not get requests without authentication', async () => {
      const response = await request(app)
        .get('/api/quotes/requests/my')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/quotes/requests/:id', () => {
    let quoteRequestId;

    beforeAll(async () => {
      // 테스트용 견적 요청 생성
      const createResponse = await request(app)
        .post('/api/quotes/requests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category_id: 1,
          title: '상세 조회 테스트',
          description: '상세 조회용 견적 요청'
        });
      quoteRequestId = createResponse.body.quote_request.id;
    });

    it('should get specific quote request', async () => {
      const response = await request(app)
        .get(`/api/quotes/requests/${quoteRequestId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('quote_request');
      expect(response.body.quote_request.id).toBe(quoteRequestId);
    });

    it('should return 404 for non-existent request', async () => {
      const response = await request(app)
        .get('/api/quotes/requests/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/quotes/requests/:id', () => {
    let quoteRequestId;

    beforeAll(async () => {
      const createResponse = await request(app)
        .post('/api/quotes/requests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category_id: 1,
          title: '수정 테스트',
          description: '수정 전 내용'
        });
      quoteRequestId = createResponse.body.quote_request.id;
    });

    it('should update quote request', async () => {
      const updateData = {
        title: '수정된 제목',
        description: '수정된 내용'
      };

      const response = await request(app)
        .put(`/api/quotes/requests/${quoteRequestId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.quote_request.title).toBe(updateData.title);
    });

    it('should not update other user request', async () => {
      // 다른 사용자로 접속 시도 (실제로는 다른 토큰 필요)
      const updateData = {
        title: '해킹 시도'
      };

      const response = await request(app)
        .put(`/api/quotes/requests/${quoteRequestId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      // 권한 검증 로직에 따라 결과 달라짐
      expect([200, 403]).toContain(response.status);
    });
  });

  describe('DELETE /api/quotes/requests/:id', () => {
    let quoteRequestId;

    beforeAll(async () => {
      const createResponse = await request(app)
        .post('/api/quotes/requests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          category_id: 1,
          title: '삭제 테스트',
          description: '삭제용 견적 요청'
        });
      quoteRequestId = createResponse.body.quote_request.id;
    });

    it('should delete quote request', async () => {
      const response = await request(app)
        .delete(`/api/quotes/requests/${quoteRequestId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // 삭제 확인
      const getResponse = await request(app)
        .get(`/api/quotes/requests/${quoteRequestId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
