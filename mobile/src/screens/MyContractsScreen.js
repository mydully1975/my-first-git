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
import { contractAPI } from '../services/api';

const MyContractsScreen = ({ navigation }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const response = await contractAPI.getMyContracts();
      setContracts(response.contracts);
    } catch (error) {
      Alert.alert('오류', '계약서 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadContracts();
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: '대기중',
      active: '활성',
      completed: '완료',
      cancelled: '취소',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: '#FFA500',
      active: '#4CAF50',
      completed: '#007AFF',
      cancelled: '#F44336',
    };
    return colorMap[status] || '#999';
  };

  const handleContractPress = (contract) => {
    if (contract.status === 'pending') {
      navigation.navigate('ContractSign', { contract });
    } else {
      Alert.alert('알림', '이미 처리된 계약서입니다.');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleContractPress(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.contractNumber}>{item.contract_number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <Text style={styles.title}>{item.quote_title}</Text>
      <Text style={styles.category}>{item.category_name}</Text>

      <View style={styles.amountRow}>
        <Text style={styles.amount}>
          {parseInt(item.total_amount).toLocaleString()}원
        </Text>
      </View>

      <Text style={styles.date}>
        {item.signed_at
          ? `서명일: ${new Date(item.signed_at).toLocaleDateString('ko-KR')}`
          : `작성일: ${new Date(item.created_at).toLocaleDateString('ko-KR')}`}
      </Text>

      {item.status === 'pending' && (
        <Text style={styles.actionText}>서명하기 →</Text>
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
        data={contracts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>계약서 내역이 없습니다.</Text>
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
    fontSize: 14,
    color: '#666',
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  actionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 5,
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

export default MyContractsScreen;