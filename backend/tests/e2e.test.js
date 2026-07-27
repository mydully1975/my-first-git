const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

describe('End-to-End Integration Tests', () => {
  let userToken;
  let adminToken;
  let userId;
  let quoteRequestId;
  let quoteId;
  let contractId;

  beforeAll(async () => {
    await db.query('BEGIN');

    // 테스트 사용자 생성
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'e2e@example.com',
        password: 'Test123!',
        name: 'E2E Test User',
        phone: '010-1111-2222'
      });

    userId = registerResponse.body.user.id;

    // 사용자 로그인
    const userLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'e2e@example.com',
        password: 'Test123!'
      });

    userToken = userLoginResponse.body.token;

    // 관리자 로그인
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@quoteservice.com',
        password: 'Admin123!'
      });

    adminToken = adminLoginResponse.body.token;
  });

  afterAll(async () => {
    await db.query('ROLLBACK');
    await db.end();
  });

  describe('Complete Quote Request Flow', () => {
    it('should complete full quote request workflow', async () => {
      // 1. 사용자가 견적 요청 생성
      const quoteRequestResponse = await request(app)
        .post('/api/quotes/requests')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          category_id: 1,
          title: 'E2E 테스트 견적 요청',
          description: '엔드투엔드 테스트용 견적 요청입니다.',
          location: '서울시 강남구',
          budget: 5000000,
          preferred_date: '2026-08-01'
        })
        .expect(201);

      quoteRequestId = quoteRequestResponse.body.quote_request.id;
      expect(quoteRequestResponse.body.quote_request.status).toBe('pending');

      // 2. 관리자가 견적 요청 확인
      const adminViewResponse = await request(app)
        .get(`/api/quotes/requests/${quoteRequestId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(adminViewResponse.body.quote_request.id).toBe(quoteRequestId);

      // 3. 관리자가 견적서 생성
      const quoteResponse = await request(app)
        .post('/api/quotes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          quote_request_id: quoteRequestId,
          title: 'E2E 테스트 견적서',
          description: '엔드투엔드 테스트용 견적서입니다.',
          price: 4800000,
          valid_until: '2026-08-15'
        })
        .expect(201);

      quoteId = quoteResponse.body.quote.id;
      expect(quoteResponse.body.quote.status).toBe('draft');

      // 4. 관리자가 견적서 발송
      await request(app)
        .post(`/api/quotes/${quoteId}/send`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // 5. 사용자가 견적서 확인
      const userQuoteResponse = await request(app)
        .get(`/api/quotes/${quoteId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(userQuoteResponse.body.quote.status).toBe('sent');

      // 6. 사용자가 견적 승인
      await request(app)
        .post(`/api/quotes/${quoteId}/approve`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // 7. 계약서 생성
      const contractResponse = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          quote_id: quoteId,
          total_amount: 4800000,
          start_date: '2026-08-01',
          end_date: '2026-08-15',
          terms: '계약 조건: 시공 기간 준수'
        })
        .expect(201);

      contractId = contractResponse.body.contract.id;
      expect(contractResponse.body.contract.status).toBe('pending');

      // 8. 사용자가 계약서 서명
      await request(app)
        .post(`/api/contracts/${contractId}/sign`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          signature: 'user_signature_data'
        })
        .expect(200);

      // 9. 관리자가 계약서 서명
      await request(app)
        .post(`/api/contracts/${contractId}/sign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          signature: 'admin_signature_data'
        })
        .expect(200);

      // 10. 계약서 상태 확인
      const finalContractResponse = await request(app)
        .get(`/api/contracts/${contractId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(finalContractResponse.body.contract.status).toBe('signed');
    });
  });

  describe('Payment Flow Integration', () => {
    it('should complete payment workflow', async () => {
      // 결제 준비
      const prepareResponse = await request(app)
        .post('/api/payments/prepare')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          contract_id: contractId,
          amount: 4800000,
          payment_method: 'credit_card'
        })
        .expect(200);

      expect(prepareResponse.body).toHaveProperty('payment_id');

      // 결제 완료 (PG사 모킹)
      const completeResponse = await request(app)
        .post('/api/payments/complete')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          payment_id: prepareResponse.body.payment_id,
          transaction_id: 'TEST_TRANSACTION_001',
          status: 'completed'
        })
        .expect(200);

      expect(completeResponse.body.payment.payment_status).toBe('completed');

      // 결제 내역 확인
      const paymentHistoryResponse = await request(app)
        .get('/api/payments/my')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(paymentHistoryResponse.body.payments).toHaveLength(1);
    });
  });

  describe('Service Schedule Flow', () => {
    it('should complete schedule management workflow', async () => {
      // 일정 생성
      const scheduleResponse = await request(app)
        .post('/api/schedules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          contract_id: contractId,
          title: '시공 시작 미팅',
          description: '시공 시작 전 현장 확인',
          scheduled_date: '2026-08-01',
          scheduled_time: '09:00',
          location: '서울시 강남구'
        })
        .expect(201);

      const scheduleId = scheduleResponse.body.schedule.id;

      // 일정 상태 업데이트
      await request(app)
        .put(`/api/schedules/${scheduleId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'in_progress' })
        .expect(200);

      // 일정 완료
      await request(app)
        .put(`/api/schedules/${scheduleId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'completed' })
        .expect(200);

      // 사용자가 일정 확인
      const userScheduleResponse = await request(app)
        .get(`/api/schedules/contract/${contractId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(userScheduleResponse.body.schedules).toHaveLength(1);
    });
  });

  describe('Review and Chat Flow', () => {
    it('should complete review and chat workflow', async () => {
      // 리뷰 작성
      const reviewResponse = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          contract_id: contractId,
          rating: 5,
          content: '서비스에 만족했습니다.',
          pros: '시공 품질 우수',
          cons: '일정 변경 있음'
        })
        .expect(201);

      const reviewId = reviewResponse.body.review.id;

      // 관리자가 리뷰 검증
      await request(app)
        .post(`/api/reviews/${reviewId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // 채팅방 생성
      const chatRoomResponse = await request(app)
        .post('/api/chat-rooms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          contract_id: contractId
        })
        .expect(201);

      const chatRoomId = chatRoomResponse.body.chat_room.id;

      // 사용자가 메시지 전송
      await request(app)
        .post('/api/chat-messages')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          chat_room_id: chatRoomId,
          message: '안녕하세요, 문의드립니다.'
        })
        .expect(201);

      // 관리자가 메시지 전송
      await request(app)
        .post('/api/chat-messages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          chat_room_id: chatRoomId,
          message: '네, 도와드리겠습니다.'
        })
        .expect(201);

      // 채팅방 메시지 확인
      const messagesResponse = await request(app)
        .get(`/api/chat-messages/room/${chatRoomId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(messagesResponse.body.messages).toHaveLength(2);
    });
  });

  describe('Error Handling and Rollback', () => {
    it('should handle errors and maintain data integrity', async () => {
      // 잘못된 데이터로 견적 요청 시도
      const invalidResponse = await request(app)
        .post('/api/quotes/requests')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: '잘못된 요청'
          // 필수 필드 누락
        })
        .expect(400);

      // 데이터베이스 무결성 확인
      const userRequests = await request(app)
        .get('/api/quotes/requests/my')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // 잘못된 요청이 데이터베이스에 영향을 주지 않음 확인
      expect(userRequests.body.quote_requests).not.toContainEqual(
        expect.objectContaining({ title: '잘못된 요청' })
      );
    });
  });
});
