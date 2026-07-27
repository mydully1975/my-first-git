import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { paymentAPI, contractAPI } from '../services/api';

const PaymentScreen = ({ route, navigation }) => {
  const { quote } = route.params;
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentType, setPaymentType] = useState('full');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const paymentMethods = [
    { id: 'card', name: '신용카드', icon: '💳' },
    { id: 'bank', name: '계좌이체', icon: '🏦' },
    { id: 'kakao', name: '카카오페이', icon: '💬' },
    { id: 'naver', name: '네이버페이', icon: '🔍' },
  ];

  const paymentTypes = [
    { id: 'full', name: '전액 결제', description: '계약금 + 잔금 한번에 결제' },
    { id: 'deposit', name: '계약금', description: '총 금액의 30% 결제' },
    { id: 'balance', name: '잔금', description: '총 금액의 70% 결제' },
  ];

  const handlePreparePayment = async () => {
    setLoading(true);
    try {
      // 먼저 계약서 생성
      const contractResponse = await contractAPI.create({
        quote_id: quote.id,
        terms: '서비스 이용약관에 동의합니다.',
      });

      const contract = contractResponse.contract;

      // 결제 준비
      const paymentResponse = await paymentAPI.prepare({
        contract_id: contract.id,
        payment_method: paymentMethod,
        payment_type: paymentType,
      });

      setPaymentData(paymentResponse);
      setShowPaymentModal(true);
    } catch (error) {
      Alert.alert('오류', error.response?.data?.error || '결제 준비에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayment = async () => {
    if (!paymentData) return;

    setLoading(true);
    try {
      // 실제 결제 처리 (PG사 연동 시)
      // 여기서는 모의 결제로 처리
      const completeResponse = await paymentAPI.complete({
        transaction_id: paymentData.payment.transaction_id,
        pg_transaction_id: `PG_${Date.now()}`,
        pg_response: { success: true },
      });

      Alert.alert('성공', '결제가 완료되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            setShowPaymentModal(false);
            navigation.navigate('MyPayments');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('오류', error.response?.data?.error || '결제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAmount = () => {
    const totalAmount = quote.total_amount;
    if (paymentType === 'deposit') {
      return totalAmount * 0.3;
    } else if (paymentType === 'balance') {
      return totalAmount * 0.7;
    }
    return totalAmount;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>결제 정보</Text>

      {/* 견적서 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>견적서 정보</Text>
        <Text style={styles.label}>견적서 번호: #{quote.id}</Text>
        <Text style={styles.label}>관리자: {quote.admin_name}</Text>
        <Text style={styles.label}>유효기간: {quote.valid_until}</Text>
      </View>

      {/* 결제 금액 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>결제 금액</Text>
        <Text style={styles.amount}>
          {parseInt(calculateAmount()).toLocaleString()}원
        </Text>
        {paymentType !== 'full' && (
          <Text style={styles.totalAmount}>
            총액: {parseInt(quote.total_amount).toLocaleString()}원
          </Text>
        )}
      </View>

      {/* 결제 수단 선택 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>결제 수단</Text>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethod,
              paymentMethod === method.id && styles.selectedPaymentMethod,
            ]}
            onPress={() => setPaymentMethod(method.id)}
          >
            <Text style={styles.paymentIcon}>{method.icon}</Text>
            <Text style={styles.paymentName}>{method.name}</Text>
            {paymentMethod === method.id && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* 결제 유형 선택 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>결제 유형</Text>
        {paymentTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.paymentType,
              paymentType === type.id && styles.selectedPaymentType,
            ]}
            onPress={() => setPaymentType(type.id)}
          >
            <View style={styles.paymentTypeContent}>
              <Text style={styles.paymentTypeName}>{type.name}</Text>
              <Text style={styles.paymentTypeDesc}>{type.description}</Text>
            </View>
            {paymentType === type.id && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* 결제 버튼 */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <TouchableOpacity style={styles.payButton} onPress={handlePreparePayment}>
          <Text style={styles.payButtonText}>
            {parseInt(calculateAmount()).toLocaleString()}원 결제하기
          </Text>
        </TouchableOpacity>
      )}

      {/* 결제 모달 */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>결제 확인</Text>
            <Text style={styles.modalAmount}>
              {parseInt(calculateAmount()).toLocaleString()}원
            </Text>
            <Text style={styles.modalMethod}>
              {paymentMethods.find((m) => m.id === paymentMethod)?.name}
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#007AFF" style={styles.modalLoader} />
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleCompletePayment}
                >
                  <Text style={styles.modalButtonText}>결제하기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowPaymentModal(false)}
                >
                  <Text style={styles.modalButtonText}>취소</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  totalAmount: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedPaymentMethod: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  paymentName: {
    fontSize: 16,
    flex: 1,
  },
  paymentType: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  paymentTypeContent: {
    flex: 1,
  },
  paymentTypeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentTypeDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  checkmark: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalMethod: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalLoader: {
    marginVertical: 20,
  },
  modalButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen;