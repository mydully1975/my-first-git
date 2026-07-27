import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import {
  Description as RequestIcon,
  Send as QuoteIcon,
  CheckCircle as ApprovedIcon,
  People as UserIcon,
  Payment as PaymentIcon,
  Assignment as ContractIcon,
  AttachMoney as RevenueIcon,
} from '@mui/icons-material';
import { adminAPI, paymentAPI, contractAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [contractStats, setContractStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [statsRes, paymentRes, contractRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        paymentAPI.getStats(),
        contractAPI.getAll({ limit: 1 }),
      ]);

      setStats(statsRes);
      setPaymentStats(paymentRes.stats);
      setContractStats({
        total: contractRes.contracts.length,
        active: contractRes.contracts.filter((c) => c.status === 'active').length,
        completed: contractRes.contracts.filter((c) => c.status === 'completed').length,
      });
    } catch (error) {
      console.error('대시보드 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h6" component="div" noWrap>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color, fontSize: 40 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        대시보드
      </Typography>

      {/* 통계 카드 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="총 견적요청"
            value={stats?.stats?.quote_requests?.total || 0}
            icon={<RequestIcon />}
            color="#007AFF"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="대기중"
            value={stats?.stats?.quote_requests?.pending || 0}
            icon={<RequestIcon />}
            color="#FFA500"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="총 견적서"
            value={stats?.stats?.quotes?.total || 0}
            icon={<QuoteIcon />}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="승인율"
            value={`${stats?.stats?.quotes?.approval_rate || 0}%`}
            icon={<ApprovedIcon />}
            color="#9C27B0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="총 계약"
            value={contractStats?.total || 0}
            icon={<ContractIcon />}
            color="#FF5722"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="활성 계약"
            value={contractStats?.active || 0}
            icon={<ContractIcon />}
            color="#009688"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="총 매출"
            value={`${parseInt(paymentStats?.total_revenue || 0).toLocaleString()}원`}
            icon={<RevenueIcon />}
            color="#E91E63"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="완료 결제"
            value={paymentStats?.completed_count || 0}
            icon={<PaymentIcon />}
            color="#3F51B5"
          />
        </Grid>
      </Grid>

      {/* 카테고리별 통계 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              카테고리별 견적요청
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>카테고리</TableCell>
                    <TableCell align="right">요청 수</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.category_stats?.slice(0, 5).map((category) => (
                    <TableRow key={category.category_id}>
                      <TableCell>{category.category_name}</TableCell>
                      <TableCell align="right">{category.request_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              사용자 통계
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                총 사용자: <strong>{stats?.stats?.users?.total || 0}</strong>명
              </Typography>
              <Typography variant="body1">
                고객: <strong>{stats?.stats?.users?.customers || 0}</strong>명
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 최근 견적요청 */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          최근 견적요청
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>제목</TableCell>
                <TableCell>카테고리</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>요청일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats?.recent_requests?.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>{request.title}</TableCell>
                  <TableCell>{request.category_name}</TableCell>
                  <TableCell>{request.status}</TableCell>
                  <TableCell>
                    {new Date(request.created_at).toLocaleDateString('ko-KR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;