const Notification = require('../models/Notification');
const PushToken = require('../models/PushToken');
const { auth } = require('../middleware/auth');

const createNotification = async (req, res) => {
  try {
    const { user_id, type, title, content, data } = req.body;

    const notification = await Notification.create({
      user_id,
      type,
      title,
      content,
      data,
    });

    // TODO: 푸시 알림 전송

    res.status(201).json({
      message: '알림이 생성되었습니다.',
      notification,
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: '알림 생성에 실패했습니다.' });
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const { limit, offset, is_read } = req.query;
    const notifications = await Notification.findByUserId(req.user.id, { limit, offset, is_read });
    res.json({ notifications });
  } catch (error) {
    console.error('Get my notifications error:', error);
    res.status(500).json({ error: '알림 조회에 실패했습니다.' });
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const { limit, offset, type, is_read } = req.query;
    const notifications = await Notification.findAll({ limit, offset, type, is_read });
    res.json({ notifications });
  } catch (error) {
    console.error('Get all notifications error:', error);
    res.status(500).json({ error: '알림 조회에 실패했습니다.' });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ error: '알림을 찾을 수 없습니다.' });
    }

    res.json({ notification });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({ error: '알림 조회에 실패했습니다.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ error: '알림을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ error: '읽음 처리 권한이 없습니다.' });
    }

    const updatedNotification = await Notification.markAsRead(id);

    res.json({
      message: '알림이 읽음 처리되었습니다.',
      notification: updatedNotification,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: '읽음 처리에 실패했습니다.' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const updatedNotifications = await Notification.markAllAsRead(req.user.id);

    res.json({
      message: '모든 알림이 읽음 처리되었습니다.',
      notifications: updatedNotifications,
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: '전체 읽음 처리에 실패했습니다.' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ error: '알림을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }

    await Notification.delete(id);

    res.json({
      message: '알림이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: '알림 삭제에 실패했습니다.' });
  }
};

const registerPushToken = async (req, res) => {
  try {
    const { token, platform, device_info } = req.body;

    const pushToken = await PushToken.create({
      user_id: req.user.id,
      token,
      platform,
      device_info,
    });

    res.status(201).json({
      message: '푸시 토큰이 등록되었습니다.',
      pushToken,
    });
  } catch (error) {
    console.error('Register push token error:', error);
    res.status(500).json({ error: '푸시 토큰 등록에 실패했습니다.' });
  }
};

const unregisterPushToken = async (req, res) => {
  try {
    const { token } = req.body;

    await PushToken.deactivateByToken(token);

    res.json({
      message: '푸시 토큰이 해제되었습니다.',
    });
  } catch (error) {
    console.error('Unregister push token error:', error);
    res.status(500).json({ error: '푸시 토큰 해제에 실패했습니다.' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);
    res.json({ unread_count: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: '읽지 않은 알림 수 조회에 실패했습니다.' });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  getAllNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  registerPushToken,
  unregisterPushToken,
  getUnreadCount,
};
