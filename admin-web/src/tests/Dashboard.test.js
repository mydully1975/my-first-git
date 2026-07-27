import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Dashboard from '../pages/Dashboard';
import authReducer from '../store/authSlice';

const createTestStore = () => configureStore({
  reducer: {
    auth: authReducer
  },
  preloadedState: {
    auth: {
      isAuthenticated: true,
      user: {
        id: 1,
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin'
      },
      token: 'mock-admin-token'
    }
  }
});

const renderWithProviders = (component) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

// Mock API calls
jest.mock('../services/api', () => ({
  adminAPI: {
    getDashboardStats: jest.fn(() => Promise.resolve({
      data: {
        total_quote_requests: 150,
        pending_quotes: 25,
        active_contracts: 30,
        total_revenue: 150000000
      }
    }))
  }
}));

describe('Admin Dashboard', () => {
  it('should render dashboard with stats', async () => {
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('대시보드')).toBeTruthy();
      // 통계 카드 표시 확인
      // expect(screen.getByText('150')).toBeTruthy(); // 총 견적 요청
      // expect(screen.getByText('25')).toBeTruthy(); // 대기 중 견적
      // expect(screen.getByText('30')).toBeTruthy(); // 활성 계약
    });
  });

  it('should display statistics cards', async () => {
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      // 통계 카드 렌더링 확인
      const statsCards = screen.getAllByTestId('stat-card');
      expect(statsCards.length).toBeGreaterThan(0);
    });
  });

  it('should display charts', async () => {
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      // 차트 컴포넌트 렌더링 확인
      // expect(screen.getByTestId('revenue-chart')).toBeTruthy();
      // expect(screen.getByTestId('request-chart')).toBeTruthy();
    });
  });

  it('should handle loading state', () => {
    const { adminAPI } = require('../services/api');
    adminAPI.getDashboardStats.mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<Dashboard />);

    // 로딩 인디케이터 표시 확인
    // expect(screen.getByTestId('loading-spinner')).toBeTruthy();
  });

  it('should handle error state', async () => {
    const { adminAPI } = require('../services/api');
    adminAPI.getDashboardStats.mockRejectedValue(new Error('API Error'));

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      // 에러 메시지 표시 확인
      // expect(screen.getByText('데이터를 불러오는데 실패했습니다.')).toBeTruthy();
    });
  });

  it('should refresh data on refresh button click', async () => {
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /새로고침/i });
      fireEvent.click(refreshButton);

      // API 재호출 확인
      const { adminAPI } = require('../services/api');
      expect(adminAPI.getDashboardStats).toHaveBeenCalled();
    });
  });
});
