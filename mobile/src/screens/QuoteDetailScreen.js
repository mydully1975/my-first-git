import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Button,
} from 'react-native';
import { quoteRequestAPI, quoteAPI } from '../services/api';

const QuoteDetailScreen = ({ route, navigation }) => {
  const { requestId } = route.params;
  const [quoteRequest, setQuoteRequest] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [requestId]);

  const loadData = async () => {
    try {
      const [requestResponse, quotesResponse] = await Promise.all([
        quoteRequestAPI.getById(requestId),
        quoteAPI.getByRequestId(requestId),
      ]);

      setQuoteRequest(requestResponse.quoteRequest);
      setQuotes(quotesResponse.quotes);
    } catch (error) {
      Alert.alert('오류', '정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (quoteId) => {
    setActionLoading(true);
    try {
      await quoteAPI.approve(quoteId);
      Alert.alert('성공', '견적서가 승인되었습니다.', [
        {
          text: '확인',
          onPress: () => loadData(),
        },
      ]);
    } catch (error) {
      Alert.alert('오류', error.response?.data?.error || '승인에 실패했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (quoteId) => {
    Alert.alert(
      '확인',
      '이 견적서를 거절하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '거절',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await quoteAPI.reject(quoteId);
              Alert.alert('성공', '견적서가 거절되었습니다.', [
                {
                  text: '확인',
                  onPress: () => loadData(),
                },
              ]);
            } catch (error) {
              Alert.alert('오류', error.response?.data?.error || '거절에 실패했습니다.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusText = (status) => {
    const statusMap = {
      draft: '초안',
      sent: '발송됨',
      approved: '승인됨',
      rejected: '거절됨',
      expired: '만료됨',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      draft: '#999',
      sent: '#007AFF',
      approved: '#4CAF50',
      rejected: '#F44336',
      expired: '#FFA500',
    };
    return colorMap[status] || '#999';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 견적요청 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>견적요청 정보</Text>
        <Text style={styles.label}>제목</Text>
        <Text style={styles.value}>{quoteRequest.title}</Text>

        <Text style={styles.label}>카테고리</Text>
        <Text style={styles.value}>{quoteRequest.category_name}</Text>

        <Text style={styles.label}>상세 설명</Text>
        <Text style={styles.value}>{quoteRequest.description}</Text>

        {quoteRequest.requirements && (
          <>
            <Text style={styles.label}>요구사항</Text>
            {quoteRequest.requirements.area && (
              <Text style={styles.value}>면적: {quoteRequest.requirements.area}㎡</Text>
            )}
            {quoteRequest.requirements.options && (
              <Text style={styles.value}>
                옵션: {quoteRequest.requirements.options.join(', ')}
              </Text>
            )}
            {quoteRequest.requirements.special_requests && (
              <Text style={styles.value}>
                특수 요청: {quoteRequest.requirements.special_requests}
              </Text>
            )}
          </>
        )}

        {quoteRequest.budget_min && quoteRequest.budget_max && (
          <>
            <Text style={styles.label}>예산 범위</Text>
            <Text style={styles.value}>
              {parseInt(quoteRequest.budget_min).toLocaleString()} ~{' '}
              {parseInt(quoteRequest.budget_max).toLocaleString()}원
            </Text>
          </>
        )}

        {quoteRequest.preferred_date && (
          <>
            <Text style={styles.label}>희망 일정</Text>
            <Text style={styles.value}>{quoteRequest.preferred_date}</Text>
          </>
        )}

        <Text style={styles.label}>요청일</Text>
        <Text style={styles.value}>
          {new Date(quoteRequest.created_at).toLocaleString('ko-KR')}
        </Text>
      </View>

      {/* 견적서 목록 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>견적서 ({quotes.length})</Text>

        {quotes.length === 0 ? (
          <Text style={styles.emptyText}>아직 견적서가 도착하지 않았습니다.</Text>
        ) : (
          quotes.map((quote) => (
            <View key={quote.id} style={styles.quoteCard}>
              <View style={styles.quoteHeader}>
                <Text style={styles.quoteAdmin}>관리자: {quote.admin_name}</Text>
                <View
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) }]}
                >
                  <Text style={styles.statusText}>{getStatusText(quote.status)}</Text>
                </View>
              </View>

              <Text style={styles.quoteAmount}>
                총액: {parseInt(quote.total_amount).toLocaleString()}원
              </Text>

              {quote.breakdown && (
                <View style={styles.breakdown}>
                  <Text style={styles.breakdownTitle}>상세 내역:</Text>
                  <Text style={styles.breakdownItem}>
                    기본 비용: {parseInt(quote.breakdown.base_price).toLocaleString()}원
                  </Text>
                  {quote.breakdown.additional_items &&
                    quote.breakdown.additional_items.map((item, index) => (
                      <Text key={index} style={styles.breakdownItem}>
                        {item.name}: {parseInt(item.amount).toLocaleString()}원
                      </Text>
                    ))}
                  <Text style={styles.breakdownItem}>
                    부가세: {parseInt(quote.breakdown.tax).toLocaleString()}원
                  </Text>
                </View>
              )}

              {quote.valid_until && (
                <Text style={styles.validUntil}>
                  유효기간: {quote.valid_until}
                </Text>
              )}

              {quote.notes && (
                <>
                  <Text style={styles.notesLabel}>참고사항</Text>
                  <Text style={styles.notes}>{quote.notes}</Text>
                </>
              )}

              {quote.status === 'sent' && !actionLoading && (
                <View style={styles.actions}>
                  <Button
                    title="승인"
                    onPress={() => handleApprove(quote.id)}
                    color="#4CAF50"
                  />
                  <Button
                    title="거절"
                    onPress={() => handleReject(quote.id)}
                    color="#F44336"
                  />
                </View>
              )}

              {quote.status === 'approved' && (
                <Button
                  title="결제하기"
                  onPress={() => navigation.navigate('Payment', { quote })}
                  color="#007AFF"
                />
              )}

              {actionLoading && (
                <ActivityIndicator size="small" color="#007AFF" style={styles.actionLoader} />
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
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
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#666',
  },
  value: {
    fontSize: 16,
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  quoteCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  quoteAdmin: {
    fontSize: 14,
    fontWeight: '600',
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
  quoteAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  breakdown: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  breakdownItem: {
    fontSize: 13,
    marginBottom: 3,
  },
  validUntil: {
    fontSize: 12,
    color: '#FFA500',
    marginBottom: 10,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionLoader: {
    marginVertical: 10,
  },
});

export default QuoteDetailScreen;