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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { quoteRequestAPI, quoteAPI, categoryAPI } from '../services/api';

const QuoteManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quoteData, setQuoteData] = useState({
    total_amount: '',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [requestsRes, quotesRes, categoriesRes] = await Promise.all([
        quoteRequestAPI.getAll(),
        quoteAPI.getAll(),
        categoryAPI.getTree(),
      ]);

      setQuoteRequests(requestsRes.quoteRequests);
      setQuotes(quotesRes.quotes);
      setCategories(categoriesRes.categories);
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

  const handleCreateQuote = async (requestId) => {
    const request = quoteRequests.find((r) => r.id === requestId);
    setSelectedRequest(request);
    setQuoteData({
      total_amount: '',
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
    setQuoteData({
      total_amount: '',
      notes: '',
    });
    setError('');
  };

  const handleQuoteSubmit = async () => {
    try {
      await quoteAPI.create({
        quote_request_id: selectedRequest.id,
        total_amount: parseFloat(quoteData.total_amount),
        notes: quoteData.notes,
      });

      handleDialogClose();
      loadData();
    } catch (error) {
      setError(error.response?.data?.error || '견적서 생성에 실패했습니다.');
    }
  };

  const handleSendQuote = async (quoteId) => {
    try {
      await quoteAPI.send(quoteId);
      loadData();
    } catch (error) {
      setError(error.response?.data?.error || '견적서 발송에 실패했습니다.');
    }
  };

  const handleDeleteQuote = async (quoteId) => {
    if (window.confirm('이 견적서를 삭제하시겠습니까?')) {
      try {
        await quoteAPI.delete(quoteId);
        loadData();
      } catch (error) {
        setError(error.response?.data?.error || '견적서 삭제에 실패했습니다.');
      }
    }
  };

  const handleStatusChange = async (requestId, status) => {
    try {
      await quoteRequestAPI.updateStatus(requestId, status);
      loadData();
    } catch (error) {
      setError(error.response?.data?.error || '상태 변경에 실패했습니다.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      quoting: 'info',
      completed: 'success',
      cancelled: 'error',
      draft: 'default',
      sent: 'info',
      approved: 'success',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: '대기중',
      quoting: '견적중',
      completed: '완료',
      cancelled: '취소',
      draft: '초안',
      sent: '발송됨',
      approved: '승인됨',
      rejected: '거절됨',
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
        견적 관리
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="견적요청" />
          <Tab label="견적서" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>제목</TableCell>
                  <TableCell>카테고리</TableCell>
                  <TableCell>고객</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>예산</TableCell>
                  <TableCell>요청일</TableCell>
                  <TableCell>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quoteRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.id}</TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>{request.category_name}</TableCell>
                    <TableCell>{request.user_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(request.status)}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {request.budget_min && request.budget_max
                        ? `${parseInt(request.budget_min).toLocaleString()} ~ ${parseInt(
                            request.budget_max
                          ).toLocaleString()}원`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleCreateQuote(request.id)}
                        disabled={request.status !== 'pending'}
                      >
                        견적서
                      </Button>
                      <Select
                        size="small"
                        value={request.status}
                        onChange={(e) => handleStatusChange(request.id, e.target.value)}
                        sx={{ ml: 1, minWidth: 100 }}
                      >
                        <MenuItem value="pending">대기중</MenuItem>
                        <MenuItem value="quoting">견적중</MenuItem>
                        <MenuItem value="completed">완료</MenuItem>
                        <MenuItem value="cancelled">취소</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>견적요청</TableCell>
                  <TableCell>관리자</TableCell>
                  <TableCell>금액</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>유효기간</TableCell>
                  <TableCell>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>{quote.id}</TableCell>
                    <TableCell>{quote.request_title}</TableCell>
                    <TableCell>{quote.admin_name}</TableCell>
                    <TableCell>
                      {parseInt(quote.total_amount).toLocaleString()}원
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(quote.status)}
                        color={getStatusColor(quote.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {quote.valid_until
                        ? new Date(quote.valid_until).toLocaleDateString('ko-KR')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {quote.status === 'draft' && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<SendIcon />}
                            onClick={() => handleSendQuote(quote.id)}
                          >
                            발송
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteQuote(quote.id)}
                            sx={{ ml: 1 }}
                          >
                            삭제
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* 견적서 생성 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>견적서 생성</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                견적요청: {selectedRequest.title}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                카테고리: {selectedRequest.category_name}
              </Typography>
              {selectedRequest.budget_min && selectedRequest.budget_max && (
                <Typography variant="subtitle2" color="textSecondary">
                  예산: {parseInt(selectedRequest.budget_min).toLocaleString()} ~{' '}
                  {parseInt(selectedRequest.budget_max).toLocaleString()}원
                </Typography>
              )}
            </Box>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="견적 금액"
            type="number"
            fullWidth
            variant="outlined"
            value={quoteData.total_amount}
            onChange={(e) => setQuoteData({ ...quoteData, total_amount: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="참고사항"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={quoteData.notes}
            onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>취소</Button>
          <Button onClick={handleQuoteSubmit} variant="contained">
            생성
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuoteManagement;