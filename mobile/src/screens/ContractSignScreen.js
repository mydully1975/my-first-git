import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { contractAPI } from '../services/api';

const ContractSignScreen = ({ route, navigation }) => {
  const { contract } = route.params;
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');

  const handleSign = async () => {
    if (!agreed) {
      Alert.alert('알림', '약관에 동의해야 서명할 수 있습니다.');
      return;
    }

    if (!signature.trim()) {
      Alert.alert('알림', '서명을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await contractAPI.sign(contract.id);
      Alert.alert('성공', '계약서가 서명되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.navigate('MyContracts'),
        },
      ]);
    } catch (error) {
      Alert.alert('오류', error.response?.data?.error || '서명에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      '확인',
      '계약을 취소하시겠습니까?',
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '예',
          style: 'destructive',
          onPress: async () => {
            try {
              await contractAPI.cancel(contract.id);
              Alert.alert('완료', '계약이 취소되었습니다.', [
                {
                  text: '확인',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              Alert.alert('오류', error.response?.data?.error || '취소에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>계약서 서명</Text>

      {/* 계약서 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계약서 정보</Text>
        <Text style={styles.label}>계약번호: {contract.contract_number}</Text>
        <Text style={styles.label}>계약금액: {parseInt(contract.total_amount).toLocaleString()}원</Text>
        {contract.start_date && (
          <Text style={styles.label}>시작일: {contract.start_date}</Text>
        )}
        {contract.end_date && (
          <Text style={styles.label}>종료일: {contract.end_date}</Text>
        )}
        <Text style={styles.label}>
          작성일: {new Date(contract.created_at).toLocaleDateString('ko-KR')}
        </Text>
      </View>

      {/* 약관 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>서비스 이용약관</Text>
        <View style={styles.termsContent}>
          <Text style={styles.termsText}>
            제1조 (목적)
            {'\n'}본 약관은 견적서비스(이하 "회사")가 제공하는 서비스의 이용조건 및 절차를 규정합니다.
            {'\n\n'}
            제2조 (서비스의 내용)
            {'\n'}회사는 다음과 같은 서비스를 제공합니다.
            {'\n'}1. 견적요청 및 견적서 발송 서비스
            {'\n'}2. 계약 및 결제 서비스
            {'\n'}3. 서비스 진행 및 관리 서비스
            {'\n\n'}
            제3조 (계약의 성립)
            {'\n'}이용자가 본 약관에 동의하고 서명을 완료함으로써 계약이 성립됩니다.
            {'\n\n'}
            제4조 (결제 및 환불)
            {'\n'}1. 이용자는 지정된 결제 수단으로 서비스 이용료를 결제해야 합니다.
            {'\n'}2. 환불은 회사의 환불 정책에 따라 처리됩니다.
            {'\n\n'}
            제5조 (서비스의 제공 및 변경)
            {'\n'}1. 회사는 이용자에게 계약된 서비스를 제공합니다.
            {'\n'}2. 천재지변 등 불가항력적인 사유로 서비스 제공이 어려운 경우, 회사는 이에 대해 책임지지 않습니다.
            {'\n\n'}
            제6조 (계약의 해지)
            {'\n'}1. 이용자는 서비스 시작 전까지 계약을 해지할 수 있습니다.
            {'\n'}2. 서비스 진행 중 계약 해지 시, 환불 정책에 따라 처리됩니다.
          </Text>
        </View>
      </View>

      {/* 약관 동의 */}
      <TouchableOpacity
        style={styles.agreementRow}
        onPress={() => setAgreed(!agreed)}
      >
        <View style={[styles.checkbox, agreed && styles.checkedCheckbox]}>
          {agreed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.agreementText}>
          위 약관 내용을 모두 확인하였으며, 이에 동의합니다.
        </Text>
      </TouchableOpacity>

      {/* 서명 입력 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>전자 서명</Text>
        <Text style={styles.signatureLabel}>
          실명을 입력하여 서명해주세요.
        </Text>
        <TextInput
          style={styles.signatureInput}
          placeholder="서명 (실명 입력)"
          value={signature}
          onChangeText={setSignature}
          autoCapitalize="words"
        />
      </View>

      {/* 버튼 */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <>
          <TouchableOpacity
            style={[styles.button, styles.signButton]}
            onPress={handleSign}
            disabled={!agreed || !signature.trim()}
          >
            <Text style={styles.buttonText}>서명하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.buttonText}>계약 취소</Text>
          </TouchableOpacity>
        </>
      )}
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
  termsContent: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 5,
    maxHeight: 300,
  },
  termsText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#333',
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  agreementText: {
    fontSize: 14,
    flex: 1,
  },
  signatureLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  signatureInput: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  signButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
});

export default ContractSignScreen;