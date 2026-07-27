import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  DatePickerIOS,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { scheduleAPI } from '../services/api';

const ScheduleScreen = ({ route, navigation }) => {
  const { contract } = route.params;
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    title: '',
    description: '',
    scheduled_date: new Date(),
    scheduled_time: '09:00',
    location: '',
    notes: '',
  });

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

  const handleCreateSchedule = async () => {
    if (!scheduleData.title || !scheduleData.scheduled_date) {
      Alert.alert('알림', '제목과 날짜를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await scheduleAPI.create({
        contract_id: contract.id,
        ...scheduleData,
        scheduled_date: scheduleData.scheduled_date.toISOString().split('T')[0],
      });

      setModalVisible(false);
      setScheduleData({
        title: '',
        description: '',
        scheduled_date: new Date(),
        scheduled_time: '09:00',
        location: '',
        notes: '',
      });
      loadSchedules();
      Alert.alert('성공', '일정이 생성되었습니다.');
    } catch (error) {
      Alert.alert('오류', error.response?.data?.error || '일정 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (scheduleId, status) => {
    try {
      await scheduleAPI.updateStatus(scheduleId, status);
      loadSchedules();
      Alert.alert('성공', '일정 상태가 업데이트되었습니다.');
    } catch (error) {
      Alert.alert('오류', error.response?.data?.error || '상태 업데이트에 실패했습니다.');
    }
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
      scheduled: '#007AFF',
      in_progress: '#FFA500',
      completed: '#4CAF50',
      cancelled: '#F44336',
      rescheduled: '#9C27B0',
    };
    return colorMap[status] || '#999';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>서비스 일정</Text>

      {/* 계약서 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계약 정보</Text>
        <Text style={styles.label}>계약번호: {contract.contract_number}</Text>
        <Text style={styles.label}>계약금액: {parseInt(contract.total_amount).toLocaleString()}원</Text>
      </View>

      {/* 일정 생성 버튼 */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.createButtonText}>+ 일정 추가</Text>
      </TouchableOpacity>

      {/* 일정 목록 */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : schedules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>등록된 일정이 없습니다.</Text>
        </View>
      ) : (
        schedules.map((schedule) => (
          <View key={schedule.id} style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              <Text style={styles.scheduleTitle}>{schedule.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(schedule.status) }]}>
                <Text style={styles.statusText}>{getStatusText(schedule.status)}</Text>
              </View>
            </View>

            {schedule.description && (
              <Text style={styles.description}>{schedule.description}</Text>
            )}

            <View style={styles.scheduleInfo}>
              <Text style={styles.infoLabel}>📅 {schedule.scheduled_date}</Text>
              {schedule.scheduled_time && (
                <Text style={styles.infoLabel}>⏰ {schedule.scheduled_time}</Text>
              )}
            </View>

            {schedule.location && (
              <Text style={styles.location}>📍 {schedule.location}</Text>
            )}

            {schedule.assigned_name && (
              <Text style={styles.assigned}>👤 담당자: {schedule.assigned_name}</Text>
            )}

            {schedule.status === 'scheduled' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.startButton]}
                  onPress={() => handleUpdateStatus(schedule.id, 'in_progress')}
                >
                  <Text style={styles.actionButtonText}>시작</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => handleUpdateStatus(schedule.id, 'cancelled')}
                >
                  <Text style={styles.actionButtonText}>취소</Text>
                </TouchableOpacity>
              </View>
            )}

            {schedule.status === 'in_progress' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.completeButton]}
                  onPress={() => handleUpdateStatus(schedule.id, 'completed')}
                >
                  <Text style={styles.actionButtonText}>완료</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}

      {/* 일정 생성 모달 */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>일정 추가</Text>

            <TextInput
              style={styles.input}
              placeholder="제목"
              value={scheduleData.title}
              onChangeText={(text) => setScheduleData({ ...scheduleData, title: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="설명"
              value={scheduleData.description}
              onChangeText={(text) => setScheduleData({ ...scheduleData, description: text })}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>날짜</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {scheduleData.scheduled_date.toLocaleDateString('ko-KR')}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={scheduleData.scheduled_date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setScheduleData({ ...scheduleData, scheduled_date: selectedDate });
                  }
                }}
                minimumDate={new Date()}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="시간 (예: 09:00)"
              value={scheduleData.scheduled_time}
              onChangeText={(text) => setScheduleData({ ...scheduleData, scheduled_time: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="장소 (선택사항)"
              value={scheduleData.location}
              onChangeText={(text) => setScheduleData({ ...scheduleData, location: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="메모 (선택사항)"
              value={scheduleData.notes}
              onChangeText={(text) => setScheduleData({ ...scheduleData, notes: text })}
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
                onPress={handleCreateSchedule}
              >
                <Text style={styles.modalButtonText}>생성</Text>
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
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  scheduleCard: {
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
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
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
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  scheduleInfo: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 15,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  assigned: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  completeButton: {
    backgroundColor: '#007AFF',
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  dateButtonText: {
    fontSize: 16,
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

export default ScheduleScreen;
