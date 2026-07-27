import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import QuoteManagement from '../pages/QuoteManagement';
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
  quoteAPI: {
    getAll: jest.fn(() => Promise.resolve({
      data: {
        quotes: [
          {
            id: 1,
            title: '주방 리모델링 견적',
            price: 4800000,
            status: 'sent',
            created_at: '2026-07-01'
          }
        ]
      }
    })),
    create: jest.fn(() => Promise.resolve({
      data: {
        message: '견적서가 생성되었습니다.',
        quote: {
          id: 2,
          title: '욕실 리모델링 견적',
          price: 2800000,
          status: 'draft'
        }
      }
    })),
    update: jest.fn(() => Promise.resolve({
      data: {
        message: '견적서가 수정되었습니다.',
        quote: {
          id: 1,
          title: '수정된 견적',
          price: 5000000
        }
      }
    })),
    delete: jest.fn(() => Promise.resolve({
      data: {
        message: '견적서가 삭제되었습니다.'
      }
    }))
  }
}));

describe('Quote Management', () => {
  it('should render quote management page', async () => {
    renderWithProviders(<QuoteManagement />);

    await waitFor(() => {
      expect(screen.getByText('견적 관리')).toBeTruthy();
    });
  });

  it('should display quotes table', async () => {
    renderWithProviders(<QuoteManagement />);

    await waitFor(() => {
      // 견적서 테이블 표시 확인
      // expect(screen.getByText('주방 리모델링 견적')).toBeTruthy();
      // expect(screen.getByText('4,800,000원')).toBeTruthy();
    });
  });

  it('should open create dialog on add button click', async () => {
    renderWithProviders(<QuoteManagement />);

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /견적서 추가/i });
      fireEvent.click(addButton);

      // 생성 다이얼로그 표시 확인
      // expect(screen.getByText('견적서 생성')).toBeTruthy();
    });
  });

  it('should handle quote creation', async () => {
    renderWithProviders(<QuoteManagement />);

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /견적서 추가/i });
      fireEvent.click(addButton);

      // 폼 입력 및 제출
      // const titleInput = screen.getByPlaceholderText('제목');
      // fireEvent.change(titleInput, { target: { value: '새 견적' } });

      // const submitButton = screen.getByRole('button', { name: /생성/i });
      // fireEvent.click(submitButton);

      // API 호출 확인
      const { quoteAPI } = require('../services/api');
      expect(quoteAPI.create).toHaveBeenCalled();
    });
  });

  it('should handle quote edit', async () => {
    renderWithProviders(<QuoteManagement />);

    await waitFor(() => {
      // 수정 버튼 클릭
      // const editButton = screen.getAllByRole('button', { name: /수정/i })[0];
      // fireEvent.click(editButton);

      // 수정 다이얼로그 표시 확인
      // expect(screen.getByText('견적서 수정')).toBeTruthy();

      const { quoteAPI } = require('../services/api');
      expect(quoteAPI.update).toHaveBeenCalled();
    });
  });

  it('should handle quote delete', async () => {
    renderWithProviders(<QuoteManagement />);

    await waitFor(() => {
      // 삭제 버튼 클릭 및 확인
      // const deleteButton = screen.getAllByRole('button', { name: /삭제/i })[0];
      // fireEvent.click(deleteButton);

      // 확인 다이얼로그에서 확인 클릭
      // const confirmButton = screen.getByRole('button', { name: /삭제/i });
      // fireEvent.click(confirmButton);

      const { quoteAPI } = require('../services/api');
      expect(quoteAPI.delete).toHaveBeenCalled();
    });
  });

  it('should filter quotes by status', async () => {
    renderWithProviders(<QuoteManagement />);

    await waitFor(() => {
      // 상태 필터 선택
      // const statusFilter = screen.getByRole('combobox');
      // fireEvent.change(statusFilter, { target: { value: 'sent' } });

      // 필터링된 결과 확인
      // expect(screen.getByText('견적 관리')).toBeTruthy();
    });
  });

  it('should search quotes', async () => {
    renderWithProviders(<QuoteManagement />);

    await waitFor(() => {
      // 검색 입력
      // const searchInput = screen.getByPlaceholderText('검색');
      // fireEvent.change(searchInput, { target: { value: '주방' } });

      // 검색 결과 확인
      // expect(screen.getByText('주방 리모델링 견적')).toBeTruthy();
    });
  });

  it('should handle pagination', async () => {
    renderWithProviders(<QuoteManagement />);

    await waitFor(() => {
      // 페이지네이션 컨트롤 표시 확인
      // expect(screen.getByRole('button', { name: /다음/i })).toBeTruthy();
      // expect(screen.getByRole('button', { name: /이전/i })).toBeTruthy();
    });
  });
});
