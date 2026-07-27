import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { chatRoomAPI, chatMessageAPI } from '../services/api';

const ChatRoomListScreen = ({ navigation }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    loadChatRooms();
    loadContracts();
  }, []);

  const loadChatRooms = async () => {
    try {
      const response = await chatRoomAPI.getMyChatRooms();
      setChatRooms(response.chat_rooms);
    } catch (error) {
      Alert.alert('오류', '채팅방 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadContracts = async () => {
    try {
      // 계약서 목록을 가져오는 API 호출 필요
      // 임시로 빈 배열 설정
      setContracts([]);
    } catch (error) {
      console.error('Load contracts error:', error);
    }
  };

  const handleCreateChatRoom = async () => {
    if (!selectedContract) {
      Alert.alert('알림', '계약서를 선택해주세요.');
      return;
    }

    try {
      await chatRoomAPI.create({
        contract_id: selectedContract.id,
      });

      setModalVisible(false);
      setSelectedContract(null);
      loadChatRooms();
      Alert.alert('성공', '채팅방이 생성되었습니다.');
    } catch (error) {
      Alert.alert('오류', error.response?.data?.error || '채팅방 생성에 실패했습니다.');
    }
  };

  const handleOpenChatRoom = (chatRoom) => {
    navigation.navigate('Chat', { chatRoom });
  };

  const renderChatRoom = ({ item }) => (
    <TouchableOpacity
      style={styles.chatRoomItem}
      onPress={() => handleOpenChatRoom(item)}
    >
      <View style={styles.chatRoomHeader}>
        <View style={styles.chatRoomInfo}>
          <Text style={styles.chatRoomTitle}>
            {item.title || item.contract_title || '채팅방'}
          </Text>
          <Text style={styles.chatRoomSubtitle}>
            {item.contract_number}
          </Text>
        </View>
        <View style={styles.chatRoomMeta}>
          {item.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread_count}</Text>
            </View>
          )}
          <Text style={styles.lastMessageTime}>
            {item.last_message_at
              ? new Date(item.last_message_at).toLocaleDateString('ko-KR')
              : ''}
          </Text>
        </View>
      </View>

      {item.last_message && (
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.last_message}
        </Text>
      )}

      {item.status === 'closed' && (
        <View style={styles.closedBadge}>
          <Text style={styles.closedText}>닫힘</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>채팅</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ 새 채팅방</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : chatRooms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>채팅방이 없습니다.</Text>
          <Text style={styles.emptySubtext}>
            새 채팅방을 만들어 대화를 시작하세요.
          </Text>
        </View>
      ) : (
        <FlatList
          data={chatRooms}
          renderItem={renderChatRoom}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* 채팅방 생성 모달 */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 채팅방 생성</Text>

            <Text style={styles.label}>계약서 선택</Text>
            {contracts.length === 0 ? (
              <View style={styles.noContracts}>
                <Text style={styles.noContractsText}>
                  채팅방을 생성할 수 있는 계약서가 없습니다.
                </Text>
              </View>
            ) : (
              <View style={styles.contractList}>
                {contracts.map((contract) => (
                  <TouchableOpacity
                    key={contract.id}
                    style={[
                      styles.contractItem,
                      selectedContract?.id === contract.id && styles.selectedContractItem,
                    ]}
                    onPress={() => setSelectedContract(contract)}
                  >
                    <Text style={styles.contractNumber}>{contract.contract_number}</Text>
                    <Text style={styles.contractAmount}>
                      {parseInt(contract.total_amount).toLocaleString()}원
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateChatRoom}
                disabled={!selectedContract}
              >
                <Text style={[
                  styles.modalButtonText,
                  !selectedContract && styles.disabledButtonText
                ]}>
                  생성
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loader: {
    marginTop: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  listContent: {
    padding: 15,
  },
  chatRoomItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatRoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatRoomInfo: {
    flex: 1,
  },
  chatRoomTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  chatRoomSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  chatRoomMeta: {
    alignItems: 'flex-end',
  },
  unreadBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastMessageTime: {
    fontSize: 11,
    color: '#999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  closedBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  closedText: {
    fontSize: 11,
    color: '#666',
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
    marginBottom: 10,
    color: '#333',
  },
  noContracts: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  noContractsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  contractList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  contractItem: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContractItem: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  contractNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  contractAmount: {
    fontSize: 12,
    color: '#666',
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
    color: '#fff',
  },
  disabledButtonText: {
    color: '#999',
  },
});

export default ChatRoomListScreen;
