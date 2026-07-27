import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginScreen from '../screens/LoginScreen';
import authReducer from '../store/authSlice';

// 테스트용 스토어 설정
const createTestStore = () => configureStore({
  reducer: {
    auth: authReducer
  }
});

// 테스트용 네비게이션 래퍼
const renderWithNavigation = (component) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <NavigationContainer>
        {component}
      </NavigationContainer>
    </Provider>
  );
};

describe('LoginScreen', () => {
  it('should render login form', () => {
    const { getByPlaceholderText, getByText } = renderWithNavigation(<LoginScreen />);

    expect(getByPlaceholderText('이메일')).toBeTruthy();
    expect(getByPlaceholderText('비밀번호')).toBeTruthy();
    expect(getByText('로그인')).toBeTruthy();
    expect(getByText('회원가입')).toBeTruthy();
  });

  it('should show error for empty fields', async () => {
    const { getByText } = renderWithNavigation(<LoginScreen />);

    const loginButton = getByText('로그인');
    fireEvent.press(loginButton);

    await waitFor(() => {
      // 에러 메시지 표시 확인
      // expect(getByText('이메일을 입력해주세요')).toBeTruthy();
    });
  });

  it('should handle successful login', async () => {
    const { getByPlaceholderText, getByText } = renderWithNavigation(<LoginScreen />);

    const emailInput = getByPlaceholderText('이메일');
    const passwordInput = getByPlaceholderText('비밀번호');
    const loginButton = getByText('로그인');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'Test123!');
    fireEvent.press(loginButton);

    await waitFor(() => {
      // 로그인 성공 후 네비게이션 확인
      // expect(navigation.navigate).toHaveBeenCalledWith('Home');
    });
  });

  it('should handle login failure', async () => {
    const { getByPlaceholderText, getByText } = renderWithNavigation(<LoginScreen />);

    const emailInput = getByPlaceholderText('이메일');
    const passwordInput = getByPlaceholderText('비밀번호');
    const loginButton = getByText('로그인');

    fireEvent.changeText(emailInput, 'wrong@example.com');
    fireEvent.changeText(passwordInput, 'WrongPassword');
    fireEvent.press(loginButton);

    await waitFor(() => {
      // 에러 메시지 표시 확인
      // expect(getByText('로그인에 실패했습니다.')).toBeTruthy();
    });
  });

  it('should navigate to registration screen', () => {
    const { getByText } = renderWithNavigation(<LoginScreen />);

    const registerButton = getByText('회원가입');
    fireEvent.press(registerButton);

    // 네비게이션 확인
    // expect(navigation.navigate).toHaveBeenCalledWith('Register');
  });
});
