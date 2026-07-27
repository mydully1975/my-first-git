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
} from '@mui/material';
import { Edit, Delete, Visibility, Check, Close, Schedule } from '@mui/icons-material';
import { scheduleAPI } from '../services/api';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState({ status: '', search: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [formData, setFormData] = useState({
    contract_id: '',
    title: '',
    description: '',
    scheduled_date: '',
    scheduled_time: '',
    location: '',
    assigned_to: '',
    notes: '',
  });

  useEffect(() => {
    loadSchedules();
  }, [page, rowsPerPage, filter]);

  const loadSchedules = async () => {
    try {
      const params = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        ...filter,
      };
      const response = await scheduleAPI.getAll(params);
      setSchedules(response.schedules);
    } catch (error) {
      console.error('Load schedules error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedSchedule(null);
    setFormData({
      contract_id: '',
      title: '',
      description: '',
      scheduled_date: '',
      scheduled_time: '',
      location: '',
      assigned_to: '',
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      contract_id: schedule.contract_id,
      title: schedule.title,
      description: schedule.description || '',
      scheduled_date: schedule.scheduled_date,
      scheduled_time: schedule.scheduled_time || '',
      location: schedule.location || '',
      assigned_to: schedule.assigned_to || '',
      notes: schedule.notes || '',
    });
    setDialogOpen(true);
  };

  const handleView = (schedule) => {
    setSelectedSchedule(schedule);
    setViewDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedSchedule) {
        await scheduleAPI.update(selectedSchedule.id, formData);
      } else {
        await scheduleAPI.create(formData);
      }
      setDialogOpen(false);
      loadSchedules();
    } catch (error) {
      console.error('Save schedule error:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      try {
        await scheduleAPI.delete(id);
        loadSchedules();
      } catch (error) {
        console.error('Delete schedule error:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await scheduleAPI.updateStatus(id, status);
      loadSchedules();
    } catch (error) {
      console.error('Update status error:', error);
      alert('상태 업데이트에 실패했습니다.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'default',
      in_progress: 'warning',
      completed: 'success',
      cancelled: 'error',
      rescheduled: 'info',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      scheduled: '예정',
      in_progress: '진행중',
      completed: '완료',
      cancelled: '취소',
      rescheduled: '일변경',
    };
    return texts[status] || status;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        일정 관리
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
            <MenuItem value="scheduled">예정</MenuItem>
            <MenuItem value="in_progress">진행중</MenuItem>
            <MenuItem value="completed">완료</MenuItem>
            <MenuItem value="cancelled">취소</MenuItem>
            <MenuItem value="rescheduled">일변경</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleCreate}>
          + 일정 추가
        </Button>
      </Box>

      {/* 일정 테이블 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>제목</TableCell>
              <TableCell>계약서 ID</TableCell>
              <TableCell>날짜</TableCell>
              <TableCell>시간</TableCell>
              <TableCell>장소</TableCell>
              <TableCell>담당자</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  일정이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>{schedule.id}</TableCell>
                  <TableCell>{schedule.title}</TableCell>
                  <TableCell>{schedule.contract_id}</TableCell>
                  <TableCell>{schedule.scheduled_date}</TableCell>
                  <TableCell>{schedule.scheduled_time || '-'}</TableCell>
                  <TableCell>{schedule.location || '-'}</TableCell>
                  <TableCell>{schedule.assigned_name || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(schedule.status)}
                      color={getStatusColor(schedule.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="상세보기">
                        <IconButton size="small" onClick={() => handleView(schedule)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="수정">
                        <IconButton size="small" onClick={() => handleEdit(schedule)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {schedule.status === 'scheduled' && (
                        <Tooltip title="시작">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleStatusChange(schedule.id, 'in_progress')}
                          >
                            <Check fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {schedule.status === 'in_progress' && (
                        <Tooltip title="완료">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleStatusChange(schedule.id, 'completed')}
                          >
                            <Check fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {schedule.status !== 'cancelled' && (
                        <Tooltip title="취소">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleStatusChange(schedule.id, 'cancelled')}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="삭제">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          <Delete fontSize="small" />
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

      {/* 일정 생성/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSchedule ? '일정 수정' : '일정 생성'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="계약서 ID"
              type="number"
              fullWidth
              value={formData.contract_id}
              onChange={(e) => setFormData({ ...formData, contract_id: e.target.value })}
            />
            <TextField
              label="제목"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              label="설명"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              label="날짜"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            />
            <TextField
              label="시간"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.scheduled_time}
              onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
            />
            <TextField
              label="장소"
              fullWidth
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <TextField
              label="담당자 ID"
              type="number"
              fullWidth
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
            />
            <TextField
              label="메모"
              fullWidth
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button onClick={handleSave} variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 일정 상세보기 다이얼로그 */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>일정 상세</DialogTitle>
        <DialogContent>
          {selectedSchedule && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {selectedSchedule.title}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Typography variant="body2">
                  <strong>계약서 ID:</strong> {selectedSchedule.contract_id}
                </Typography>
                <Typography variant="body2">
                  <strong>상태:</strong> {getStatusText(selectedSchedule.status)}
                </Typography>
                <Typography variant="body2">
                  <strong>날짜:</strong> {selectedSchedule.scheduled_date}
                </Typography>
                <Typography variant="body2">
                  <strong>시간:</strong> {selectedSchedule.scheduled_time || '-'}
                </Typography>
                <Typography variant="body2">
                  <strong>장소:</strong> {selectedSchedule.location || '-'}
                </Typography>
                <Typography variant="body2">
                  <strong>담당자:</strong> {selectedSchedule.assigned_name || '-'}
                </Typography>
              </Box>
              {selectedSchedule.description && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>설명:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedSchedule.description}
                  </Typography>
                </Box>
              )}
              {selectedSchedule.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>메모:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedSchedule.notes}
                  </Typography>
                </Box>
              )}
              {selectedSchedule.created_at && (
                <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
                  생성일: {new Date(selectedSchedule.created_at).toLocaleString('ko-KR')}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduleManagement;
