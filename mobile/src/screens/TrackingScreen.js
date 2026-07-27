import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { scheduleAPI } from '../services/api';

const TrackingScreen = ({ route, navigation }) => {
  const { contract } = route.params;
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const response = await scheduleAPI.getContractSchedules(contract.id);
      setSchedules(response.schedules);
    } catch (error) {
      Alert.alert('오류', '일정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getProgress = () => {
    if (schedules.length === 0) return 0;
    const completed = schedules.filter(s => s.status === 'completed').length;
    return Math.round((completed / schedules.length) * 100);
  };

  const getStatusText = (status) => {
    const statusMap = {
      scheduled: '예정',
      in_progress: '진행중',
      completed: '완료',
      cancelled: '취소',
      rescheduled: '일변경',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      scheduled: '#E3F2FD',
      in_progress: '#FFF3E0',
      completed: '#E8F5E9',
      cancelled: '#FFEBEE',
      rescheduled: '#F3E5F5',
    };
    return colorMap[status] || '#f5f5f5';
  };

  const getStatusBorderColor = (status) => {
    const colorMap = {
      scheduled: '#2196F3',
      in_progress: '#FF9800',
      completed: '#4CAF50',
      cancelled: '#F44336',
      rescheduled: '#9C27B0',
    };
    return colorMap[status] || '#999';
  };

  const getOverallStatus = () => {
    if (schedules.length === 0) return '시작 전';
    const allCompleted = schedules.every(s => s.status === 'completed');
    const anyInProgress = schedules.some(s => s.status === 'in_progress');
    const allCancelled = schedules.every(s => s.status === 'cancelled');

    if (allCancelled) return '취소됨';
    if (allCompleted) return '완료';
    if (anyInProgress) return '진행중';
    return '시작 전';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>진행 상태 트래킹</Text>

      {/* 계약서 정보 */}
      <View style={styles.header}>
        <Text style={styles.contractNumber}>{contract.contract_number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getProgress() === 100 ? '#4CAF50' : '#007AFF' }]}>
          <Text style={styles.statusText}>{getOverallStatus()}</Text>
        </View>
      </View>

      {/* 진행률 */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>전체 진행률</Text>
          <Text style={styles.progressPercent}>{getProgress()}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
        </View>
        <Text style={styles.progressDetail}>
          완료: {schedules.filter(s => s.status === 'completed').length} / {schedules.length}
        </Text>
      </View>

      {/* 일정 타임라인 */}
      <View style={styles.timelineSection}>
        <Text style={styles.sectionTitle}>일정 타임라인</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : schedules.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>등록된 일정이 없습니다.</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {schedules.map((schedule, index) => (
              <View key={schedule.id} style={styles.timelineItem}>
                {/* 타임라인 라인 */}
                {index !== schedules.length - 1 && (
                  <View style={[styles.timelineLine, {
                    backgroundColor: schedule.status === 'completed' ? '#4CAF50' : '#E0E0E0'
                  }]} />
                )}

                {/* 타임라인 점 */}
                <View style={[
                  styles.timelineDot,
                  { backgroundColor: getStatusBorderColor(schedule.status) }
                ]}>
                  {schedule.status === 'completed' && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>

                {/* 일정 카드 */}
                <View style={[
                  styles.timelineCard,
                  { backgroundColor: getStatusColor(schedule.status) }
                ]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{schedule.title}</Text>
                    <Text style={[
                      styles.cardStatus,
                      { color: getStatusBorderColor(schedule.status) }
                    ]}>
                      {getStatusText(schedule.status)}
                    </Text>
                  </View>

                  <Text style={styles.cardDate}>📅 {schedule.scheduled_date}</Text>
                  {schedule.scheduled_time && (
                    <Text style={styles.cardTime}>⏰ {schedule.scheduled_time}</Text>
                  )}

                  {schedule.description && (
                    <Text style={styles.cardDescription}>{schedule.description}</Text>
                  )}

                  {schedule.location && (
                    <Text style={styles.cardLocation}>📍 {schedule.location}</Text>
                  )}

                  {schedule.assigned_name && (
                    <Text style={styles.cardAssigned}>👤 {schedule.assigned_name}</Text>
                  )}

                  {schedule.status === 'completed' && schedule.completed_at && (
                    <Text style={styles.completedAt}>
                      완료일: {new Date(schedule.completed_at).toLocaleDateString('ko-KR')}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 통계 정보 */}
      {schedules.length > 0 && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>통계</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {schedules.filter(s => s.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>완료</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {schedules.filter(s => s.status === 'in_progress').length}
              </Text>
              <Text style={styles.statLabel}>진행중</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {schedules.filter(s => s.status === 'scheduled').length}
              </Text>
              <Text style={styles.statLabel}>예정</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {schedules.filter(s => s.status === 'cancelled').length}
              </Text>
              <Text style={styles.statLabel}>취소</Text>
            </View>
          </View>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  contractNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  progressDetail: {
    fontSize: 14,
    color: '#666',
  },
  timelineSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
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
  timeline: {
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  timelineLine: {
    width: 2,
    marginLeft: 14,
    marginTop: 5,
    flex: 1,
  },
  timelineDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timelineCard: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  cardStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  cardTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  cardLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  cardAssigned: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  completedAt: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 5,
  },
  statsSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default TrackingScreen;
