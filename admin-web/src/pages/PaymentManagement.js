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
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { paymentAPI } from '../services/api';

const PaymentManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [paymentsRes, statsRes] = await Promise.all([
        paymentAPI.getAll(),
        paymentAPI.getStats(),
      ]);

      setPayments(paymentsRes.payments);
      setStats(statsRes.stats);
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

  const handleRefundDialogOpen = (payment) => {
    setSelectedPayment(payment);
    setRefundReason('');
    setRefundDialogOpen(true);
  };

  const handleRefundDialogClose = () => {
    setRefundDialogOpen(false);
    setSelectedPayment(null);
    setRefundReason('');
    setError('');
  };

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      setError('환불 사유를 입력해주세요.');
      return;
    }

    try {
      await paymentAPI.refund(selectedPayment.id, refundReason);
      handleRefundDialogClose();
      loadData();
    } catch (error) {
      setError(error.response?.data?.error || '환불에 실패했습니다.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      completed: 'success',
      failed: 'error',
      refunded: 'secondary',
      cancelled: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: '대기중',
      processing: '처리중',
      completed: '완료',
      failed: '실패',
      refunded: '환불',
      cancelled: '취소',
    };
    return texts[status] || status;
  };

  const getPaymentTypeText = (type) => {
    const texts = {
      full: '전액',
      deposit: '계약금',
      balance: '잔금',
    };
    return texts[type] || type;
  };

  const getPaymentMethodText = (method) => {
    const texts = {
      card: '신용카드',
      bank: '계좌이체',
      kakao: '카카오페이',
      naver: '네이버페이',
    };
    return texts[method] || method;
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
        결제 관리
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* 통계 카드 */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  총 매출
                </Typography>
                <Typography variant="h5" component="div">
                  {parseInt(stats.total_revenue).toLocaleString()}원
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  순매출
                </Typography>
                <Typography variant="h5" component="div">
                  {parseInt(stats.net_revenue).toLocaleString()}원
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  환불액
                </Typography>
                <Typography variant="h5" component="div" color="error">
                  {parseInt(stats.total_refund).toLocaleString()}원
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  완료된 결제
                </Typography>
                <Typography variant="h5" component="div">
                  {stats.completed_count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="전체 결제" />
            <Tab label="완료" />
            <Tab label="환불" />
            <Tab label="대기중" />
          </Tabs>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>계약번호</TableCell>
                <TableCell>고객</TableCell>
                <TableCell>금액</TableCell>
                <TableCell>결제수단</TableCell>
                <TableCell>결제유형</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>결제일</TableCell>
                <TableCell>작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments
                .filter((payment) => {
                  if (tabValue === 0) return true;
                  if (tabValue === 1) return payment.status === 'completed';
                  if (tabValue === 2) return payment.status === 'refunded';
                  if (tabValue === 3) return payment.status === 'pending';
                  return true;
                })
                .map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.id}</TableCell>
                    <TableCell>{payment.contract_number}</TableCell>
                    <TableCell>{payment.user_name}</TableCell>
                    <TableCell>
                      {parseInt(payment.amount).toLocaleString()}원
                    </TableCell>
                    <TableCell>{getPaymentMethodText(payment.payment_method)}</TableCell>
                    <TableCell>{getPaymentTypeText(payment.payment_type)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(payment.status)}
                        color={getStatusColor(payment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleDateString('ko-KR')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {payment.status === 'completed' && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ReceiptIcon />}
                          onClick={() => handleRefundDialogOpen(payment)}
                        >
                          환불
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 환불 다이얼로그 */}
      <Dialog open={refundDialogOpen} onClose={handleRefundDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>결제 환불</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                결제 ID: {selectedPayment.id}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                계약번호: {selectedPayment.contract_number}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                환불금액: {parseInt(selectedPayment.amount).toLocaleString()}원
              </Typography>
            </Box>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="환불 사유"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRefundDialogClose}>취소</Button>
          <Button onClick={handleRefund} variant="contained" color="error">
            환불 처리
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentManagement;