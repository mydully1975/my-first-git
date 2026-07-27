import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 인증 API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

// 카테고리 API
export const categoryAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },
  getTree: async () => {
    const response = await api.get('/categories/tree');
    return response.data;
  },
};

// 견적요청 API
export const quoteRequestAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/quotes/requests', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/quotes/requests/${id}`);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/quotes/requests/${id}/status`, { status });
    return response.data;
  },
};

// 견적서 API
export const quoteAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/quotes', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/quotes/${id}`);
    return response.data;
  },
  create: async (quoteData) => {
    const response = await api.post('/quotes', quoteData);
    return response.data;
  },
  update: async (id, quoteData) => {
    const response = await api.put(`/quotes/${id}`, quoteData);
    return response.data;
  },
  send: async (id) => {
    const response = await api.post(`/quotes/${id}/send`);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/quotes/${id}`);
    return response.data;
  },
};

// 관리자 API
export const adminAPI = {
  getDashboardStats: async (params = {}) => {
    const response = await api.get('/admin/dashboard', { params });
    return response.data;
  },
  getQuoteRequestStats: async (params = {}) => {
    const response = await api.get('/admin/stats/quote-requests', { params });
    return response.data;
  },
};

// 계약서 API
export const contractAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/contracts', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },
  update: async (id, contractData) => {
    const response = await api.put(`/contracts/${id}`, contractData);
    return response.data;
  },
  complete: async (id) => {
    const response = await api.post(`/contracts/${id}/complete`);
    return response.data;
  },
};

// 결제 API
export const paymentAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/payments', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },
  refund: async (id, refundReason) => {
    const response = await api.post(`/payments/${id}/refund`, { refund_reason: refundReason });
    return response.data;
  },
  getStats: async (params = {}) => {
    const response = await api.get('/payments/stats', { params });
    return response.data;
  },
};

// 일정 API
export const scheduleAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/schedules', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },
  create: async (scheduleData) => {
    const response = await api.post('/schedules', scheduleData);
    return response.data;
  },
  update: async (id, scheduleData) => {
    const response = await api.put(`/schedules/${id}`, scheduleData);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/schedules/${id}/status`, { status });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  },
  getContractSchedules: async (contractId) => {
    const response = await api.get(`/schedules/contract/${contractId}`);
    return response.data;
  },
};

// 리뷰 API
export const reviewAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/reviews', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },
  verify: async (id) => {
    const response = await api.post(`/reviews/${id}/verify`);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/reviews/stats');
    return response.data;
  },
};

// 채팅방 API
export const chatRoomAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/chat-rooms', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/chat-rooms/${id}`);
    return response.data;
  },
  getMessages: async (chatRoomId, params = {}) => {
    const response = await api.get(`/chat-messages/room/${chatRoomId}`, { params });
    return response.data;
  },
};

// 채팅 메시지 API
export const chatMessageAPI = {
  send: async (messageData) => {
    const response = await api.post('/chat-messages', messageData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/chat-messages/${id}`);
    return response.data;
  },
};

export default api;