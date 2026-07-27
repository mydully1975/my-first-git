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
  Rating,
} from '@mui/material';
import { Visibility, Delete, Verified, Star, StarBorder } from '@mui/icons-material';
import { reviewAPI } from '../services/api';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState({ is_verified: '', search: '' });
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [page, rowsPerPage, filter]);

  const loadReviews = async () => {
    try {
      const params = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        ...filter,
      };
      const response = await reviewAPI.getAll(params);
      setReviews(response.reviews);
    } catch (error) {
      console.error('Load reviews error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await reviewAPI.getStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const handleView = (review) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
  };

  const handleVerify = async (id) => {
    try {
      await reviewAPI.verify(id);
      loadReviews();
      loadStats();
    } catch (error) {
      console.error('Verify review error:', error);
      alert('검증에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      try {
        await reviewAPI.delete(id);
        loadReviews();
        loadStats();
      } catch (error) {
        console.error('Delete review error:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const renderStars = (rating) => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Rating value={rating} readOnly precision={0.5} size="small" />
        <Typography variant="body2" sx={{ ml: 1 }}>
          {rating}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        리뷰 관리
      </Typography>

      {/* 통계 카드 */}
      {stats && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Paper sx={{ p: 2, minWidth: 200, flex: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">
              전체 리뷰 수
            </Typography>
            <Typography variant="h4">{stats.total_reviews}</Typography>
          </Paper>
          <Paper sx={{ p: 2, minWidth: 200, flex: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">
              평균 평점
            </Typography>
            <Typography variant="h4">{stats.average_rating}</Typography>
          </Paper>
          <Paper sx={{ p: 2, minWidth: 200, flex: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">
              검증된 리뷰
            </Typography>
            <Typography variant="h4">{stats.verified_reviews}</Typography>
          </Paper>
          <Paper sx={{ p: 2, minWidth: 200, flex: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">
              미검증 리뷰
            </Typography>
            <Typography variant="h4">{stats.unverified_reviews}</Typography>
          </Paper>
        </Box>
      )}

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
          <InputLabel>검증 상태</InputLabel>
          <Select
            value={filter.is_verified}
            label="검증 상태"
            onChange={(e) => setFilter({ ...filter, is_verified: e.target.value })}
          >
            <MenuItem value="">전체</MenuItem>
            <MenuItem value="true">검증됨</MenuItem>
            <MenuItem value="false">미검증</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={() => loadReviews()}>
          새로고침
        </Button>
      </Box>

      {/* 리뷰 테이블 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>사용자</TableCell>
              <TableCell>계약서 ID</TableCell>
              <TableCell>평점</TableCell>
              <TableCell>내용</TableCell>
              <TableCell>검증 상태</TableCell>
              <TableCell>작성일</TableCell>
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
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  리뷰가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>{review.id}</TableCell>
                  <TableCell>{review.user_name || '익명'}</TableCell>
                  <TableCell>{review.contract_id}</TableCell>
                  <TableCell>{renderStars(review.rating)}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {review.content}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {review.is_verified ? (
                      <Chip
                        label="검증됨"
                        color="success"
                        size="small"
                        icon={<Verified />}
                      />
                    ) : (
                      <Chip label="미검증" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(review.created_at).toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="상세보기">
                        <IconButton size="small" onClick={() => handleView(review)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!review.is_verified && (
                        <Tooltip title="검증">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleVerify(review.id)}
                          >
                            <Verified fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="삭제">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(review.id)}
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

      {/* 리뷰 상세보기 다이얼로그 */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>리뷰 상세</DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {renderStars(selectedReview.rating)}
                {selectedReview.is_verified && (
                  <Chip
                    label="검증됨"
                    color="success"
                    size="small"
                    icon={<Verified />}
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Typography variant="body2">
                  <strong>사용자:</strong> {selectedReview.user_name || '익명'}
                </Typography>
                <Typography variant="body2">
                  <strong>계약서 ID:</strong> {selectedReview.contract_id}
                </Typography>
                <Typography variant="body2">
                  <strong>작성일:</strong> {new Date(selectedReview.created_at).toLocaleString('ko-KR')}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  리뷰 내용
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedReview.content}
                </Typography>
              </Box>

              {selectedReview.pros && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    장점
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedReview.pros}
                  </Typography>
                </Box>
              )}

              {selectedReview.cons && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    단점
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedReview.cons}
                  </Typography>
                </Box>
              )}

              {!selectedReview.is_verified && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    handleVerify(selectedReview.id);
                    setViewDialogOpen(false);
                  }}
                  sx={{ mt: 2 }}
                >
                  리뷰 검증
                </Button>
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

export default ReviewManagement;
