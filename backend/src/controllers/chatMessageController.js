const ChatMessage = require('../models/ChatMessage');
const ChatRoom = require('../models/ChatRoom');
const { auth, adminAuth } = require('../middleware/auth');

const sendMessage = async (req, res) => {
  try {
    const { chat_room_id, message, message_type = 'text', file_url } = req.body;

    // 채팅방 확인
    const chatRoom = await ChatRoom.findById(chat_room_id);
    if (!chatRoom) {
      return res.status(404).json({ error: '채팅방을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (chatRoom.user_id !== req.user.id && chatRoom.admin_id !== req.user.id) {
      return res.status(403).json({ error: '메시지 전송 권한이 없습니다.' });
    }

    // 채팅방 상태 확인
    if (chatRoom.status !== 'active') {
      return res.status(400).json({ error: '활성 상태의 채팅방만 메시지를 전송할 수 있습니다.' });
    }

    const chatMessage = await ChatMessage.create({
      chat_room_id,
      sender_id: req.user.id,
      message,
      message_type,
      file_url,
    });

    // TODO: 실시간 알림 전송 (WebSocket)
    // TODO: 푸시 알림 전송

    res.status(201).json({
      message: '메시지가 전송되었습니다.',
      chatMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: '메시지 전송에 실패했습니다.' });
  }
};

const getChatRoomMessages = async (req, res) => {
  try {
    const { chat_room_id } = req.params;
    const { limit, offset } = req.query;

    // 채팅방 확인
    const chatRoom = await ChatRoom.findById(chat_room_id);
    if (!chatRoom) {
      return res.status(404).json({ error: '채팅방을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (chatRoom.user_id !== req.user.id && chatRoom.admin_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '조회 권한이 없습니다.' });
    }

    const messages = await ChatMessage.findByChatRoomId(chat_room_id, { limit, offset });

    // 읽음 처리
    await ChatMessage.markRoomAsRead(chat_room_id, req.user.id);

    res.json({ messages });
  } catch (error) {
    console.error('Get chat room messages error:', error);
    res.status(500).json({ error: '메시지 조회에 실패했습니다.' });
  }
};

const getUnreadMessages = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const messages = await ChatMessage.findUnreadByUser(req.user.id, { limit, offset });
    res.json({ messages });
  } catch (error) {
    console.error('Get unread messages error:', error);
    res.status(500).json({ error: '읽지 않은 메시지 조회에 실패했습니다.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const chatMessage = await ChatMessage.findById(id);

    if (!chatMessage) {
      return res.status(404).json({ error: '메시지를 찾을 수 없습니다.' });
    }

    // 권한 확인 (수신자만 읽음 처리 가능)
    const chatRoom = await ChatRoom.findById(chatMessage.chat_room_id);
    if (chatRoom.user_id !== req.user.id && chatRoom.admin_id !== req.user.id) {
      return res.status(403).json({ error: '읽음 처리 권한이 없습니다.' });
    }

    if (chatMessage.sender_id === req.user.id) {
      return res.status(400).json({ error: '자신의 메시지는 읽음 처리할 수 없습니다.' });
    }

    const updatedMessage = await ChatMessage.markAsRead(id);

    res.json({
      message: '메시지가 읽음 처리되었습니다.',
      chatMessage: updatedMessage,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: '읽음 처리에 실패했습니다.' });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const chatMessage = await ChatMessage.findById(id);

    if (!chatMessage) {
      return res.status(404).json({ error: '메시지를 찾을 수 없습니다.' });
    }

    // 권한 확인 (본인만 삭제 가능)
    if (chatMessage.sender_id !== req.user.id) {
      return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }

    await ChatMessage.delete(id);

    res.json({
      message: '메시지가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: '메시지 삭제에 실패했습니다.' });
  }
};

module.exports = {
  sendMessage,
  getChatRoomMessages,
  getUnreadMessages,
  markAsRead,
  deleteMessage,
};
