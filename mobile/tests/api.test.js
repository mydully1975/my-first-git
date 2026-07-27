import { authAPI, quoteRequestAPI, quoteAPI } from '../services/api';

// Mock axios
jest.mock('axios');
import axios from 'axios';

describe('API Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authAPI', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test123!',
        name: 'Test User',
        phone: '010-1234-5678'
      };

      const mockResponse = {
        data: {
          message: '회원가입이 완료되었습니다.',
          user: {
            id: 1,
            email: userData.email,
            name: userData.name
          }
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await authAPI.register(userData);

      expect(axios.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should login user', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'Test123!'
      };

      const mockResponse = {
        data: {
          message: '로그인 성공',
          token: 'mock-jwt-token',
          user: {
            id: 1,
            email: credentials.email,
            name: 'Test User'
          }
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await authAPI.login(credentials);

      expect(axios.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse.data);
      expect(result.token).toBeDefined();
    });

    it('should get user profile', async () => {
      const mockResponse = {
        data: {
          user: {
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
            phone: '010-1234-5678'
          }
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await authAPI.getProfile();

      expect(axios.get).toHaveBeenCalledWith('/auth/profile');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network Error');
      axios.post.mockRejectedValue(mockError);

      await expect(authAPI.login({ email: 'test@example.com', password: 'wrong' }))
        .rejects.toThrow('Network Error');
    });
  });

  describe('quoteRequestAPI', () => {
    it('should create quote request', async () => {
      const requestData = {
        category_id: 1,
        title: '테스트 견적 요청',
        description: '테스트용 견적 요청입니다.',
        location: '서울시 강남구',
        budget: 5000000
      };

      const mockResponse = {
        data: {
          message: '견적 요청이 생성되었습니다.',
          quote_request: {
            id: 1,
            ...requestData
          }
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await quoteRequestAPI.create(requestData);

      expect(axios.post).toHaveBeenCalledWith('/quotes/requests', requestData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should get my quote requests', async () => {
      const mockResponse = {
        data: {
          quote_requests: [
            {
              id: 1,
              title: '주방 리모델링',
              status: 'pending'
            }
          ]
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await quoteRequestAPI.getMyRequests();

      expect(axios.get).toHaveBeenCalledWith('/quotes/requests/my');
      expect(result.quote_requests).toHaveLength(1);
    });

    it('should get quote request by id', async () => {
      const requestId = 1;
      const mockResponse = {
        data: {
          quote_request: {
            id: requestId,
            title: '주방 리모델링',
            description: '상세 설명'
          }
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await quoteRequestAPI.getById(requestId);

      expect(axios.get).toHaveBeenCalledWith(`/quotes/requests/${requestId}`);
      expect(result.quote_request.id).toBe(requestId);
    });

    it('should update quote request', async () => {
      const requestId = 1;
      const updateData = {
        title: '수정된 제목',
        description: '수정된 설명'
      };

      const mockResponse = {
        data: {
          message: '견적 요청이 수정되었습니다.',
          quote_request: {
            id: requestId,
            ...updateData
          }
        }
      };

      axios.put.mockResolvedValue(mockResponse);

      const result = await quoteRequestAPI.update(requestId, updateData);

      expect(axios.put).toHaveBeenCalledWith(`/quotes/requests/${requestId}`, updateData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should delete quote request', async () => {
      const requestId = 1;
      const mockResponse = {
        data: {
          message: '견적 요청이 삭제되었습니다.'
        }
      };

      axios.delete.mockResolvedValue(mockResponse);

      const result = await quoteRequestAPI.delete(requestId);

      expect(axios.delete).toHaveBeenCalledWith(`/quotes/requests/${requestId}`);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('quoteAPI', () => {
    it('should get quotes by request id', async () => {
      const requestId = 1;
      const mockResponse = {
        data: {
          quotes: [
            {
              id: 1,
              quote_request_id: requestId,
              title: '주방 리모델링 견적',
              price: 4800000,
              status: 'sent'
            }
          ]
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await quoteAPI.getByRequestId(requestId);

      expect(axios.get).toHaveBeenCalledWith(`/quotes/request/${requestId}`);
      expect(result.quotes).toHaveLength(1);
    });

    it('should approve quote', async () => {
      const quoteId = 1;
      const mockResponse = {
        data: {
          message: '견적이 승인되었습니다.',
          quote: {
            id: quoteId,
            status: 'approved'
          }
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await quoteAPI.approve(quoteId);

      expect(axios.post).toHaveBeenCalledWith(`/quotes/${quoteId}/approve`);
      expect(result.quote.status).toBe('approved');
    });

    it('should reject quote', async () => {
      const quoteId = 1;
      const mockResponse = {
        data: {
          message: '견적이 거절되었습니다.',
          quote: {
            id: quoteId,
            status: 'rejected'
          }
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await quoteAPI.reject(quoteId);

      expect(axios.post).toHaveBeenCalledWith(`/quotes/${quoteId}/reject`);
      expect(result.quote.status).toBe('rejected');
    });
  });
});
