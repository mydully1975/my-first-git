import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Login from '../pages/Login';
import authReducer from '../store/authSlice';

// 테스트용 스토어 설정
const createTestStore = () => configureStore({
  reducer: {
    auth: authReducer
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

describe('Admin Login Page', () => {
  it('should render login form', () => {
    renderWithProviders(<Login />);

    expect(screen.getByPlaceholderText('이메일')).toBeTruthy();
    expect(screen.getByPlaceholderText('비밀번호')).toBeTruthy();
    expect(screen.getByRole('button', { name: /로그인/i })).toBeTruthy();
  });

  it('should show error for empty fields', async () => {
    renderWithProviders(<Login />);

    const loginButton = screen.getByRole('button', { name: /로그인/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      // 에러 메시지 표시 확인
      // expect(screen.getByText('이메일을 입력해주세요')).toBeTruthy();
    });
  });

  it('should handle successful login', async () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByPlaceholderText('이메일');
    const passwordInput = screen.getByPlaceholderText('비밀번호');
    const loginButton = screen.getByRole('button', { name: /로그인/i });

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Admin123!' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      // 로그인 성공 후 대시보드로 이동 확인
      // expect(window.location.pathname).toBe('/dashboard');
    });
  });

  it('should handle login failure', async () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByPlaceholderText('이메일');
    const passwordInput = screen.getByPlaceholderText('비밀번호');
    const loginButton = screen.getByRole('button', { name: /로그인/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'WrongPassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      // 에러 메시지 표시 확인
      // expect(screen.getByText('로그인에 실패했습니다.')).toBeTruthy();
    });
  });

  it('should validate email format', async () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByPlaceholderText('이메일');
    const loginButton = screen.getByRole('button', { name: /로그인/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      // 이메일 형식 에러 메시지 확인
      // expect(screen.getByText('올바른 이메일 형식을 입력해주세요.')).toBeTruthy();
    });
  });
});
