import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  async (config) => {
    const token = await AsyncStorage.getItem('token');
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
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그아웃 처리
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userInfo');
      // TODO: 네비게이션으로 로그인 화면으로 이동
    }
    return Promise.reject(error);
  }
);

// 인증 API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
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

  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
};

// 견적요청 API
export const quoteRequestAPI = {
  create: async (requestData) => {
    const response = await api.post('/quotes/requests', requestData);
    return response.data;
  },

  getMyRequests: async (params = {}) => {
    const response = await api.get('/quotes/requests/my', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/quotes/requests/${id}`);
    return response.data;
  },

  update: async (id, requestData) => {
    const response = await api.put(`/quotes/requests/${id}`, requestData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/quotes/requests/${id}`);
    return response.data;
  },
};

// 견적서 API
export const quoteAPI = {
  getByRequestId: async (requestId) => {
    const response = await api.get(`/quotes/request/${requestId}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/quotes/${id}`);
    return response.data;
  },

  approve: async (id) => {
    const response = await api.post(`/quotes/${id}/approve`);
    return response.data;
  },

  reject: async (id) => {
    const response = await api.post(`/quotes/${id}/reject`);
    return response.data;
  },
};

// 계약서 API
export const contractAPI = {
  create: async (contractData) => {
    const response = await api.post('/contracts', contractData);
    return response.data;
  },

  getMyContracts: async (params = {}) => {
    const response = await api.get('/contracts/my', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },

  sign: async (id) => {
    const response = await api.post(`/contracts/${id}/sign`);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.post(`/contracts/${id}/cancel`);
    return response.data;
  },
};

// 결제 API
export const paymentAPI = {
  prepare: async (paymentData) => {
    const response = await api.post('/payments/prepare', paymentData);
    return response.data;
  },

  complete: async (paymentData) => {
    const response = await api.post('/payments/complete', paymentData);
    return response.data;
  },

  getMyPayments: async (params = {}) => {
    const response = await api.get('/payments/my', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },
};

// 일정 API
export const scheduleAPI = {
  create: async (scheduleData) => {
    const response = await api.post('/schedules', scheduleData);
    return response.data;
  },

  getMySchedules: async (params = {}) => {
    const response = await api.get('/schedules/my', { params });
    return response.data;
  },

  getContractSchedules: async (contractId) => {
    const response = await api.get(`/schedules/contract/${contractId}`);
    return response.data;
  },

  getAssignedSchedules: async (params = {}) => {
    const response = await api.get('/schedules/assigned', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/schedules/${id}`);
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

  getUpcoming: async (params = {}) => {
    const response = await api.get('/schedules/upcoming', { params });
    return response.data;
  },
};

// 리뷰 API
export const reviewAPI = {
  create: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  getMyReviews: async (params = {}) => {
    const response = await api.get('/reviews/my', { params });
    return response.data;
  },

  getContractReviews: async (contractId) => {
    const response = await api.get(`/reviews/contract/${contractId}`);
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get('/reviews', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },

  update: async (id, reviewData) => {
    const response = await api.put(`/reviews/${id}`, reviewData);
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
  create: async (chatRoomData) => {
    const response = await api.post('/chat-rooms', chatRoomData);
    return response.data;
  },

  getMyChatRooms: async (params = {}) => {
    const response = await api.get('/chat-rooms/my', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/chat-rooms/${id}`);
    return response.data;
  },

  update: async (id, chatRoomData) => {
    const response = await api.put(`/chat-rooms/${id}`, chatRoomData);
    return response.data;
  },

  close: async (id) => {
    const response = await api.post(`/chat-rooms/${id}/close`);
    return response.data;
  },
};

// 채팅 메시지 API
export const chatMessageAPI = {
  send: async (messageData) => {
    const response = await api.post('/chat-messages', messageData);
    return response.data;
  },

  getRoomMessages: async (chatRoomId, params = {}) => {
    const response = await api.get(`/chat-messages/room/${chatRoomId}`, { params });
    return response.data;
  },

  getUnread: async (params = {}) => {
    const response = await api.get('/chat-messages/unread', { params });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.post(`/chat-messages/${id}/read`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/chat-messages/${id}`);
    return response.data;
  },
};

// 알림 API
export const notificationAPI = {
  getMyNotifications: async (params = {}) => {
    const response = await api.get('/notifications/my', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  registerPushToken: async (tokenData) => {
    const response = await api.post('/notifications/push-token', tokenData);
    return response.data;
  },

  unregisterPushToken: async (tokenData) => {
    const response = await api.post('/notifications/push-token/unregister', tokenData);
    return response.data;
  },
};

export default api;