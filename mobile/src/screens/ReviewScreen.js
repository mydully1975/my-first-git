import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StarRatingComponent,
} from 'react-native';
import { reviewAPI } from '../services/api';

const ReviewScreen = ({ route, navigation }) => {
  const { contract } = route.params;
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    content: '',
    pros: '',
    cons: '',
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const [reviewsResponse, myReviewsResponse] = await Promise.all([
        reviewAPI.getContractReviews(contract.id),
        reviewAPI.getMyReviews(),
      ]);

      setReviews(reviewsResponse.reviews);
      const myContractReview = myReviewsResponse.reviews.find(r => r.contract_id === contract.id);
      setMyReview(myContractReview || null);
    } catch (error) {
      Alert.alert('오류', '리뷰를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = async () => {
    if (reviewData.rating === 0) {
      Alert.alert('알림', '평점을 선택해주세요.');
      return;
    }

    if (!reviewData.content.trim()) {
      Alert.alert('알림', '리뷰 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await reviewAPI.create({
        contract_id: contract.id,
        ...reviewData,
      });

      setModalVisible(false);
      setReviewData({
        rating: 5,
        content: '',
        pros: '',
        cons: '',
      });
      setRating(5);
      loadReviews();
      Alert.alert('성공', '리뷰가 작성되었습니다.');
    } catch (error) {
      Alert.alert('오류', error.response?.data?.error || '리뷰 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReview = async () => {
    if (reviewData.rating === 0) {
      Alert.alert('알림', '평점을 선택해주세요.');
      return;
    }

    if (!reviewData.content.trim()) {
      Alert.alert('알림', '리뷰 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await reviewAPI.update(myReview.id, reviewData);

      setModalVisible(false);
      setReviewData({
        rating: 5,
        content: '',
        pros: '',
        cons: '',
      });
      setRating(5);
      loadReviews();
      Alert.alert('성공', '리뷰가 수정되었습니다.');
    } catch (error) {
      Alert.alert('오류', error.response?.data?.error || '리뷰 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    Alert.alert(
      '삭제 확인',
      '정말로 이 리뷰를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await reviewAPI.delete(myReview.id);
              loadReviews();
              Alert.alert('성공', '리뷰가 삭제되었습니다.');
            } catch (error) {
              Alert.alert('오류', '리뷰 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const renderStars = (value, size = 24, interactive = false) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => {
              if (interactive) {
                setRating(star);
                setReviewData({ ...reviewData, rating: star });
              }
            }}
          >
            <Text style={[
              styles.star,
              { fontSize: size, color: star <= value ? '#FFD700' : '#E0E0E0' }
            ]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>리뷰</Text>

      {/* 계약서 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계약 정보</Text>
        <Text style={styles.label}>계약번호: {contract.contract_number}</Text>
        <Text style={styles.label}>계약금액: {parseInt(contract.total_amount).toLocaleString()}원</Text>
      </View>

      {/* 리뷰 통계 */}
      <View style={styles.statsSection}>
        <View style={styles.statsLeft}>
          <Text style={styles.averageRating}>{getAverageRating()}</Text>
          {renderStars(Math.round(getAverageRating()), 32)}
          <Text style={styles.totalReviews}>총 {reviews.length}개 리뷰</Text>
        </View>
        <View style={styles.statsRight}>
          {[5, 4, 3, 2, 1].map((star) => (
            <View key={star} style={styles.distributionRow}>
              <Text style={styles.starLabel}>{star}점</Text>
              <View style={styles.barContainer}>
                <View style={[
                  styles.bar,
                  {
                    width: `${reviews.length > 0 ? (distribution[star] / reviews.length) * 100 : 0}%`
                  }
                ]} />
              </View>
              <Text style={styles.countLabel}>{distribution[star]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 내 리뷰 */}
      {myReview ? (
        <View style={styles.myReviewSection}>
          <View style={styles.myReviewHeader}>
            <Text style={styles.myReviewTitle}>내 리뷰</Text>
            <View style={styles.myReviewActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setReviewData({
                    rating: myReview.rating,
                    content: myReview.content,
                    pros: myReview.pros || '',
                    cons: myReview.cons || '',
                  });
                  setRating(myReview.rating);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.editButtonText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteReview}
              >
                <Text style={styles.deleteButtonText}>삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.reviewCard}>
            {renderStars(myReview.rating)}
            <Text style={styles.reviewContent}>{myReview.content}</Text>
            {myReview.pros && (
              <View style={styles.prosCons}>
                <Text style={styles.prosConsLabel}>장점:</Text>
                <Text style={styles.prosConsText}>{myReview.pros}</Text>
              </View>
            )}
            {myReview.cons && (
              <View style={styles.prosCons}>
                <Text style={styles.prosConsLabel}>단점:</Text>
                <Text style={styles.prosConsText}>{myReview.cons}</Text>
              </View>
            )}
            <Text style={styles.reviewDate}>
              {new Date(myReview.created_at).toLocaleDateString('ko-KR')}
            </Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.createReviewButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.createReviewButtonText}>+ 리뷰 작성</Text>
        </TouchableOpacity>
      )}

      {/* 전체 리뷰 목록 */}
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>전체 리뷰</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : reviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 리뷰가 없습니다.</Text>
          </View>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <Text style={styles.reviewerName}>
                    {review.user_name || '익명'}
                  </Text>
                  {renderStars(review.rating, 20)}
                </View>
                <Text style={styles.reviewDate}>
                  {new Date(review.created_at).toLocaleDateString('ko-KR')}
                </Text>
              </View>

              <Text style={styles.reviewContent}>{review.content}</Text>

              {review.pros && (
                <View style={styles.prosCons}>
                  <Text style={styles.prosConsLabel}>장점:</Text>
                  <Text style={styles.prosConsText}>{review.pros}</Text>
                </View>
              )}

              {review.cons && (
                <View style={styles.prosCons}>
                  <Text style={styles.prosConsLabel}>단점:</Text>
                  <Text style={styles.prosConsText}>{review.cons}</Text>
                </View>
              )}

              {review.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ 인증된 리뷰</Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* 리뷰 작성/수정 모달 */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {myReview ? '리뷰 수정' : '리뷰 작성'}
            </Text>

            <Text style={styles.label}>평점</Text>
            <View style={styles.ratingContainer}>
              {renderStars(rating, 40, true)}
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="리뷰 내용을 입력해주세요."
              value={reviewData.content}
              onChangeText={(text) => setReviewData({ ...reviewData, content: text })}
              multiline
              numberOfLines={4}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="장점 (선택사항)"
              value={reviewData.pros}
              onChangeText={(text) => setReviewData({ ...reviewData, pros: text })}
              multiline
              numberOfLines={2}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="단점 (선택사항)"
              value={reviewData.cons}
              onChangeText={(text) => setReviewData({ ...reviewData, cons: text })}
              multiline
              numberOfLines={2}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={myReview ? handleUpdateReview : handleCreateReview}
              >
                <Text style={styles.modalButtonText}>
                  {myReview ? '수정' : '작성'}
                </Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statsSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    flexDirection: 'row',
  },
  statsLeft: {
    alignItems: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  starContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  star: {
    marginHorizontal: 2,
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statsRight: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  starLabel: {
    fontSize: 12,
    width: 30,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  countLabel: {
    fontSize: 12,
    width: 20,
    textAlign: 'right',
  },
  myReviewSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  myReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  myReviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  myReviewActions: {
    flexDirection: 'row',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginRight: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F44336',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  createReviewButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  createReviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewsSection: {
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  reviewContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    lineHeight: 20,
  },
  prosCons: {
    marginBottom: 8,
  },
  prosConsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 3,
  },
  prosConsText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  ratingContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReviewScreen;
