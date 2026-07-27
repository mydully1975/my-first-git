import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { paymentAPI } from '../services/api';

const MyPaymentsScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await paymentAPI.getMyPayments();
      setPayments(response.payments);
    } catch (error) {
      Alert.alert('오류', '결제 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: '대기중',
      processing: '처리중',
      completed: '완료',
      failed: '실패',
      refunded: '환불',
      cancelled: '취소',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: '#FFA500',
      processing: '#007AFF',
      completed: '#4CAF50',
      failed: '#F44336',
      refunded: '#9C27B0',
      cancelled: '#999',
    };
    return colorMap[status] || '#999';
  };

  const getPaymentTypeText = (type) => {
    const typeMap = {
      full: '전액',
      deposit: '계약금',
      balance: '잔금',
    };
    return typeMap[type] || type;
  };

  const getPaymentMethodText = (method) => {
    const methodMap = {
      card: '신용카드',
      bank: '계좌이체',
      kakao: '카카오페이',
      naver: '네이버페이',
    };
    return methodMap[method] || method;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.contractNumber}>{item.contract_number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.paymentInfo}>
        <Text style={styles.amount}>
          {parseInt(item.amount).toLocaleString()}원
        </Text>
        <Text style={styles.paymentType}>{getPaymentTypeText(item.payment_type)}</Text>
      </View>

      <Text style={styles.paymentMethod}>{getPaymentMethodText(item.payment_method)}</Text>
      <Text style={styles.date}>
        {item.paid_at
          ? new Date(item.paid_at).toLocaleDateString('ko-KR')
          : new Date(item.created_at).toLocaleDateString('ko-KR')}
      </Text>

      {item.refund_amount && (
        <Text style={styles.refundInfo}>
          환불액: {parseInt(item.refund_amount).toLocaleString()}원
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={payments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>결제 내역이 없습니다.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  contractNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  paymentType: {
    fontSize: 14,
    color: '#666',
  },
  paymentMethod: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  refundInfo: {
    fontSize: 14,
    color: '#9C27B0',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default MyPaymentsScreen;