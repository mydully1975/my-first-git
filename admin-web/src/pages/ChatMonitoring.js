import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
} from '@mui/material';
import { Visibility, Message, Close, Send } from '@mui/icons-material';
import { chatRoomAPI, chatMessageAPI } from '../services/api';

const ChatMonitoring = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState({ status: '', search: '' });
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [adminMessage, setAdminMessage] = useState('');

  useEffect(() => {
    loadChatRooms();
  }, [page, rowsPerPage, filter]);

  const loadChatRooms = async () => {
    try {
      const params = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        ...filter,
      };
      const response = await chatRoomAPI.getAll(params);
      setChatRooms(response.chat_rooms);
    } catch (error) {
      console.error('Load chat rooms error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (chatRoom) => {
    setSelectedChatRoom(chatRoom);
    setViewDialogOpen(true);
    loadMessages(chatRoom.id);
  };

  const loadMessages = async (chatRoomId) => {
    setMessagesLoading(true);
    try {
      const response = await chatRoomAPI.getMessages(chatRoomId);
      setMessages(response.messages);
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!adminMessage.trim()) return;

    try {
      const response = await chatMessageAPI.send({
        chat_room_id: selectedChatRoom.id,
        message: adminMessage.trim(),
      });
      setMessages([...messages, response.message]);
      setAdminMessage('');
    } catch (error) {
      console.error('Send message error:', error);
      alert('메시지 전송에 실패했습니다.');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('정말로 이 메시지를 삭제하시겠습니까?')) {
      try {
        await chatMessageAPI.delete(messageId);
        setMessages(messages.filter(msg => msg.id !== messageId));
      } catch (error) {
        console.error('Delete message error:', error);
        alert('메시지 삭제에 실패했습니다.');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      closed: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      active: '활성',
      closed: '닫힘',
    };
    return texts[status] || status;
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        채팅 모니터링
      </Typography>

      {/* 필터 영역 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="검색"
          size="small"
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>상태</InputLabel>
          <Select
            value={filter.status}
            label="상태"
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <MenuItem value="">전체</MenuItem>
            <MenuItem value="active">활성</MenuItem>
            <MenuItem value="closed">닫힘</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={() => loadChatRooms()}>
          새로고침
        </Button>
      </Box>

      {/* 채팅방 테이블 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>제목</TableCell>
              <TableCell>계약서 ID</TableCell>
              <TableCell>사용자</TableCell>
              <TableCell>마지막 메시지</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>생성일</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : chatRooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  채팅방이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              chatRooms.map((chatRoom) => (
                <TableRow key={chatRoom.id}>
                  <TableCell>{chatRoom.id}</TableCell>
                  <TableCell>{chatRoom.title || chatRoom.contract_title || '-'}</TableCell>
                  <TableCell>{chatRoom.contract_id}</TableCell>
                  <TableCell>{chatRoom.user_name || '-'}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 150,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {chatRoom.last_message || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(chatRoom.status)}
                      color={getStatusColor(chatRoom.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(chatRoom.created_at).toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="메시지 보기">
                        <IconButton size="small" onClick={() => handleView(chatRoom)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 채팅방 상세보기 다이얼로그 */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedChatRoom?.title || selectedChatRoom?.contract_title || '채팅방'}
            </Typography>
            <Chip
              label={selectedChatRoom ? getStatusText(selectedChatRoom.status) : ''}
              color={selectedChatRoom ? getStatusColor(selectedChatRoom.status) : 'default'}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {selectedChatRoom && (
            <>
              <Box sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="textSecondary">
                  계약서 ID: {selectedChatRoom.contract_id}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  사용자: {selectedChatRoom.user_name || '-'}
                </Typography>
              </Box>

              {/* 메시지 목록 */}
              <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                {messagesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Typography>로딩 중...</Typography>
                  </Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Typography color="textSecondary">메시지가 없습니다.</Typography>
                  </Box>
                ) : (
                  <List>
                    {messages.map((message, index) => {
                      const isAdmin = message.sender_role === 'admin';
                      return (
                        <React.Fragment key={message.id}>
                          <ListItem
                            sx={{
                              flexDirection: 'column',
                              alignItems: isAdmin ? 'flex-end' : 'flex-start',
                              py: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: 1,
                                maxWidth: '70%',
                              }}
                            >
                              {!isAdmin && (
                                <Avatar sx={{ width: 32, height: 32 }}>
                                  {message.sender_name?.[0] || 'U'}
                                </Avatar>
                              )}
                              <Box
                                sx={{
                                  backgroundColor: isAdmin ? '#1976d2' : '#f5f5f5',
                                  color: isAdmin ? 'white' : 'text.primary',
                                  borderRadius: 2,
                                  px: 2,
                                  py: 1,
                                  maxWidth: '100%',
                                }}
                              >
                                {!isAdmin && (
                                  <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                                    {message.sender_name || '사용자'}
                                  </Typography>
                                )}
                                <Typography variant="body2">{message.message}</Typography>
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
                                  {formatMessageTime(message.created_at)}
                                </Typography>
                              </Box>
                              {isAdmin && (
                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                                  A
                                </Avatar>
                              )}
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteMessage(message.id)}
                              sx={{ mt: 0.5 }}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </ListItem>
                          {index < messages.length - 1 && <Divider />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                )}
              </Box>

              {/* 관리자 메시지 입력 */}
              {selectedChatRoom.status === 'active' && (
                <Box sx={{ display: 'flex', gap: 1, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="메시지를 입력하세요..."
                    value={adminMessage}
                    onChange={(e) => setAdminMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    multiline
                    maxRows={3}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!adminMessage.trim()}
                    sx={{ minWidth: 100 }}
                  >
                    <Send sx={{ mr: 1 }} />
                    전송
                  </Button>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatMonitoring;
