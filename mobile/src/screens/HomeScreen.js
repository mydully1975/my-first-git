import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

const HomeScreen = ({ navigation }) => {
  const services = [
    { id: 1, name: '홈 인테리어', icon: '🏠', color: '#FF6B6B' },
    { id: 2, name: '이사', icon: '📦', color: '#4ECDC4' },
    { id: 3, name: '청소', icon: '🧹', color: '#45B7D1' },
    { id: 4, name: '수리', icon: '🔧', color: '#96CEB4' },
  ];

  const handleServicePress = (service) => {
    navigation.navigate('QuoteRequest');
  };

  return (
    <ScrollView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>견적서비스</Text>
        <Text style={styles.headerSubtitle}>원하는 서비스의 견적을 받아보세요</Text>
      </View>

      {/* 서비스 카테고리 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>서비스 카테고리</Text>
        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceCard, { backgroundColor: service.color }]}
              onPress={() => handleServicePress(service)}
            >
              <Text style={styles.serviceIcon}>{service.icon}</Text>
              <Text style={styles.serviceName}>{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 빠른 견적요청 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>빠른 견적요청</Text>
        <TouchableOpacity
          style={styles.quickQuoteButton}
          onPress={() => navigation.navigate('QuoteRequest')}
        >
          <Text style={styles.quickQuoteText}>지금 견적요청하기</Text>
        </TouchableOpacity>
      </View>

      {/* 이용 방법 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>이용 방법</Text>
        <View style={styles.stepContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepTitle}>견적요청</Text>
            <Text style={styles.stepDescription}>
              원하는 서비스와 상세 정보를 입력하세요
            </Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepTitle}>견적서 수신</Text>
            <Text style={styles.stepDescription}>
              전문가가 분석한 견적서를 받아보세요
            </Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>견적 승인</Text>
            <Text style={styles.stepDescription}>
              마음에 드는 견적을 선택하고 승인하세요
            </Text>
          </View>
        </View>
      </View>

      {/* 고객 지원 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>고객 지원</Text>
        <TouchableOpacity style={styles.supportCard}>
          <Text style={styles.supportTitle}>자주 묻는 질문</Text>
          <Text style={styles.supportDescription}>궁금한 점을 확인해보세요</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.supportCard}>
          <Text style={styles.supportTitle}>1:1 문의</Text>
          <Text style={styles.supportDescription}>고객센터에 문의하세요</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 30,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  quickQuoteButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  quickQuoteText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContainer: {
    flexDirection: 'column',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  supportCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  supportDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;