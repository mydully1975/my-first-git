import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { contractAPI } from '../services/api';

const ContractManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [editData, setEditData] = useState({
    terms: '',
    start_date: '',
    end_date: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const response = await contractAPI.getAll();
      setContracts(response.contracts);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditDialogOpen = (contract) => {
    setSelectedContract(contract);
    setEditData({
      terms: contract.terms || '',
      start_date: contract.start_date || '',
      end_date: contract.end_date || '',
    });
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedContract(null);
    setEditData({
      terms: '',
      start_date: '',
      end_date: '',
    });
    setError('');
  };

  const handleEdit = async () => {
    try {
      await contractAPI.update(selectedContract.id, editData);
      handleEditDialogClose();
      loadContracts();
    } catch (error) {
      setError(error.response?.data?.error || '수정에 실패했습니다.');
    }
  };

  const handleComplete = async (contractId) => {
    if (window.confirm('이 계약을 완료 처리하시겠습니까?')) {
      try {
        await contractAPI.complete(contractId);
        loadContracts();
      } catch (error) {
        setError(error.response?.data?.error || '완료 처리에 실패했습니다.');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      active: 'success',
      completed: 'info',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: '대기중',
      active: '활성',
      completed: '완료',
      cancelled: '취소',
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        계약서 관리
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="전체 계약" />
            <Tab label="대기중" />
            <Tab label="활성" />
            <Tab label="완료" />
          </Tabs>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>계약번호</TableCell>
                <TableCell>고객</TableCell>
                <TableCell>견적서 제목</TableCell>
                <TableCell>금액</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>시작일</TableCell>
                <TableCell>종료일</TableCell>
                <TableCell>서명일</TableCell>
                <TableCell>작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contracts
                .filter((contract) => {
                  if (tabValue === 0) return true;
                  if (tabValue === 1) return contract.status === 'pending';
                  if (tabValue === 2) return contract.status === 'active';
                  if (tabValue === 3) return contract.status === 'completed';
                  return true;
                })
                .map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>{contract.id}</TableCell>
                    <TableCell>{contract.contract_number}</TableCell>
                    <TableCell>{contract.user_name}</TableCell>
                    <TableCell>{contract.quote_title}</TableCell>
                    <TableCell>
                      {parseInt(contract.total_amount).toLocaleString()}원
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(contract.status)}
                        color={getStatusColor(contract.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {contract.start_date
                        ? new Date(contract.start_date).toLocaleDateString('ko-KR')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {contract.end_date
                        ? new Date(contract.end_date).toLocaleDateString('ko-KR')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {contract.signed_at
                        ? new Date(contract.signed_at).toLocaleDateString('ko-KR')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {contract.status === 'pending' && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditDialogOpen(contract)}
                        >
                          수정
                        </Button>
                      )}
                      {contract.status === 'active' && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckIcon />}
                          onClick={() => handleComplete(contract.id)}
                        >
                          완료
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 계약서 수정 다이얼로그 */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>계약서 수정</DialogTitle>
        <DialogContent>
          {selectedContract && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                계약번호: {selectedContract.contract_number}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                고객: {selectedContract.user_name}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                금액: {parseInt(selectedContract.total_amount).toLocaleString()}원
              </Typography>
            </Box>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="약관"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={editData.terms}
            onChange={(e) => setEditData({ ...editData, terms: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="시작일"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={editData.start_date}
            onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="종료일"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={editData.end_date}
            onChange={(e) => setEditData({ ...editData, end_date: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>취소</Button>
          <Button onClick={handleEdit} variant="contained">
            수정
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractManagement;