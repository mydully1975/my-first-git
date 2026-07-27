import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { chatMessageAPI, chatRoomAPI } from '../services/api';

const ChatScreen = ({ route, navigation }) => {
  const { chatRoom } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({
      title: chatRoom.title || chatRoom.contract_title || '채팅',
    });
    loadMessages();
    // TODO: 실시간 메시지 수신을 위한 WebSocket/SSE 연결
  }, []);

  const loadMessages = async () => {
    try {
      const response = await chatMessageAPI.getRoomMessages(chatRoom.id);
      setMessages(response.messages);
      scrollToBottom();
    } catch (error) {
      Alert.alert('오류', '메시지를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      return;
    }

    setSending(true);
    try {
      const response = await chatMessageAPI.send({
        chat_room_id: chatRoom.id,
        message: messageText.trim(),
      });

      setMessages([...messages, response.message]);
      setMessageText('');
      scrollToBottom();
    } catch (error) {
      Alert.alert('오류', error.response?.data?.error || '메시지 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await chatMessageAPI.markAsRead(messageId);
      // 메시지 상태 업데이트
      setMessages(messages.map(msg =>
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    Alert.alert(
      '삭제 확인',
      '정말로 이 메시지를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatMessageAPI.delete(messageId);
              setMessages(messages.filter(msg => msg.id !== messageId));
            } catch (error) {
              Alert.alert('오류', '메시지 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleCloseChatRoom = async () => {
    Alert.alert(
      '채팅방 닫기',
      '정말로 이 채팅방을 닫으시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '닫기',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatRoomAPI.close(chatRoom.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('오류', '채팅방 닫기에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.sender_id === chatRoom.user_id;
    const isAdmin = item.sender_role === 'admin';

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble,
        ]}>
          {!isOwnMessage && (
            <Text style={styles.senderName}>
              {item.sender_name || (isAdmin ? '관리자' : '상대방')}
            </Text>
          )}
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
          ]}>
            {item.message}
          </Text>
          <View style={styles.messageMeta}>
            <Text style={styles.messageTime}>
              {new Date(item.created_at).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {isOwnMessage && item.is_read && (
              <Text style={styles.readStatus}>읽음</Text>
            )}
          </View>
        </View>

        {isOwnMessage && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteMessage(item.id)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {chatRoom.contract_number}
        </Text>
        {chatRoom.status !== 'closed' && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseChatRoom}
          >
            <Text style={styles.closeButtonText}>채팅방 닫기</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />
      )}

      {chatRoom.status === 'closed' ? (
        <View style={styles.closedBanner}>
          <Text style={styles.closedBannerText}>이 채팅방은 닫혔습니다.</Text>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="메시지를 입력하세요..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
            editable={!sending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || sending) && styles.disabledSendButton,
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>전송</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
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
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F44336',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loader: {
    marginTop: 50,
  },
  messagesList: {
    padding: 15,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 15,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 5,
  },
  otherBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 5,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  readStatus: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 5,
  },
  deleteButton: {
    marginLeft: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  disabledSendButton: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  closedBanner: {
    padding: 15,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
  },
  closedBannerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
});

export default ChatScreen;
