const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');
const Contract = require('../models/Contract');
const { auth, adminAuth } = require('../middleware/auth');

const createChatRoom = async (req, res) => {
  try {
    const { contract_id, title } = req.body;

    // 계약서 확인
    const contract = await Contract.findById(contract_id);
    if (!contract) {
      return res.status(404).json({ error: '계약서를 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (contract.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '채팅방 생성 권한이 없습니다.' });
    }

    // 이미 채팅방이 있는지 확인
    const existingRoom = await ChatRoom.findByContractId(contract_id);
    if (existingRoom) {
      return res.status(400).json({ error: '이미 채팅방이 존재합니다.' });
    }

    const chatRoom = await ChatRoom.create({
      contract_id,
      user_id: contract.user_id,
      admin_id: req.user.role === 'admin' ? req.user.id : null,
      title: title || `계약 ${contract.contract_number}`,
    });

    res.status(201).json({
      message: '채팅방이 생성되었습니다.',
      chatRoom,
    });
  } catch (error) {
    console.error('Create chat room error:', error);
    res.status(500).json({ error: '채팅방 생성에 실패했습니다.' });
  }
};

const getMyChatRooms = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const chatRooms = await ChatRoom.findByUserId(req.user.id, { limit, offset });
    
    // 각 채팅방의 최신 메시지 조회
    const chatRoomsWithMessages = await Promise.all(
      chatRooms.map(async (room) => {
        const latestMessage = await ChatMessage.getLatestMessage(room.id);
        const unreadCount = await ChatMessage.getUnreadCount(room.id);
        return {
          ...room,
          latest_message: latestMessage,
          unread_count: unreadCount,
        };
      })
    );

    res.json({ chatRooms: chatRoomsWithMessages });
  } catch (error) {
    console.error('Get my chat rooms error:', error);
    res.status(500).json({ error: '채팅방 조회에 실패했습니다.' });
  }
};

const getAllChatRooms = async (req, res) => {
  try {
    const { limit, offset, status } = req.query;
    const chatRooms = await ChatRoom.findAll({ limit, offset, status });
    res.json({ chatRooms });
  } catch (error) {
    console.error('Get all chat rooms error:', error);
    res.status(500).json({ error: '채팅방 조회에 실패했습니다.' });
  }
};

const getChatRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const chatRoom = await ChatRoom.findById(id);

    if (!chatRoom) {
      return res.status(404).json({ error: '채팅방을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (chatRoom.user_id !== req.user.id && chatRoom.admin_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '조회 권한이 없습니다.' });
    }

    res.json({ chatRoom });
  } catch (error) {
    console.error('Get chat room error:', error);
    res.status(500).json({ error: '채팅방 조회에 실패했습니다.' });
  }
};

const updateChatRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const chatRoom = await ChatRoom.findById(id);

    if (!chatRoom) {
      return res.status(404).json({ error: '채팅방을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (chatRoom.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '수정 권한이 없습니다.' });
    }

    const updatedChatRoom = await ChatRoom.update(id, updates);

    res.json({
      message: '채팅방이 업데이트되었습니다.',
      chatRoom: updatedChatRoom,
    });
  } catch (error) {
    console.error('Update chat room error:', error);
    res.status(500).json({ error: '채팅방 업데이트에 실패했습니다.' });
  }
};

const closeChatRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const chatRoom = await ChatRoom.findById(id);

    if (!chatRoom) {
      return res.status(404).json({ error: '채팅방을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (chatRoom.user_id !== req.user.id && chatRoom.admin_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '닫기 권한이 없습니다.' });
    }

    const closedChatRoom = await ChatRoom.updateStatus(id, 'closed');

    res.json({
      message: '채팅방이 닫혔습니다.',
      chatRoom: closedChatRoom,
    });
  } catch (error) {
    console.error('Close chat room error:', error);
    res.status(500).json({ error: '채팅방 닫기에 실패했습니다.' });
  }
};

module.exports = {
  createChatRoom,
  getMyChatRooms,
  getAllChatRooms,
  getChatRoomById,
  updateChatRoom,
  closeChatRoom,
};
