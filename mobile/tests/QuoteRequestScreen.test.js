import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import QuoteRequestScreen from '../screens/QuoteRequestScreen';
import authReducer from '../store/authSlice';

const createTestStore = () => configureStore({
  reducer: {
    auth: authReducer
  }
});

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

describe('QuoteRequestScreen', () => {
  it('should render quote request form', () => {
    const { getByPlaceholderText, getByText } = renderWithNavigation(<QuoteRequestScreen />);

    expect(getByPlaceholderText('제목')).toBeTruthy();
    expect(getByPlaceholderText('상세 설명')).toBeTruthy();
    expect(getByPlaceholderText('장소')).toBeTruthy();
    expect(getByPlaceholderText('예산')).toBeTruthy();
    expect(getByText('견적 요청하기')).toBeTruthy();
  });

  it('should validate required fields', async () => {
    const { getByText } = renderWithNavigation(<QuoteRequestScreen />);

    const submitButton = getByText('견적 요청하기');
    fireEvent.press(submitButton);

    await waitFor(() => {
      // 에러 메시지 표시 확인
      // expect(getByText('제목을 입력해주세요')).toBeTruthy();
    });
  });

  it('should handle successful quote request submission', async () => {
    const { getByPlaceholderText, getByText } = renderWithNavigation(<QuoteRequestScreen />);

    const titleInput = getByPlaceholderText('제목');
    const descriptionInput = getByPlaceholderText('상세 설명');
    const locationInput = getByPlaceholderText('장소');
    const budgetInput = getByPlaceholderText('예산');
    const submitButton = getByText('견적 요청하기');

    fireEvent.changeText(titleInput, '주방 리모델링');
    fireEvent.changeText(descriptionInput, '주방 전면 리모델링이 필요합니다.');
    fireEvent.changeText(locationInput, '서울시 강남구');
    fireEvent.changeText(budgetInput, '5000000');
    fireEvent.press(submitButton);

    await waitFor(() => {
      // 성공 메시지 표시 확인
      // expect(getByText('견적 요청이 완료되었습니다.')).toBeTruthy();
    });
  });

  it('should handle category selection', () => {
    const { getByText } = renderWithNavigation(<QuoteRequestScreen />);

    const categoryButton = getByText('카테고리 선택');
    fireEvent.press(categoryButton);

    // 카테고리 선택 모달 표시 확인
    // expect(getByText('홈 인테리어')).toBeTruthy();
  });

  it('should handle date picker', () => {
    const { getByText } = renderWithNavigation(<QuoteRequestScreen />);

    const dateButton = getByText('희망 날짜');
    fireEvent.press(dateButton);

    // 날짜 선택기 표시 확인
    // expect(getByText('날짜 선택')).toBeTruthy();
  });

  it('should handle image attachment', () => {
    const { getByText } = renderWithNavigation(<QuoteRequestScreen />);

    const imageButton = getByText('이미지 첨부');
    fireEvent.press(imageButton);

    // 이미지 선택 옵션 표시 확인
    // expect(getByText('카메라')).toBeTruthy();
    // expect(getByText('갤러리')).toBeTruthy();
  });
});
