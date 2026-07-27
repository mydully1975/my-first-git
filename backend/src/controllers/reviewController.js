const Review = require('../models/Review');
const Contract = require('../models/Contract');
const { auth, adminAuth } = require('../middleware/auth');

const createReview = async (req, res) => {
  try {
    const {
      contract_id,
      rating,
      title,
      content,
      service_quality,
      communication,
      timeliness,
      images,
    } = req.body;

    // 계약서 확인
    const contract = await Contract.findById(contract_id);
    if (!contract) {
      return res.status(404).json({ error: '계약서를 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (contract.user_id !== req.user.id) {
      return res.status(403).json({ error: '리뷰 작성 권한이 없습니다.' });
    }

    // 계약서 상태 확인 (완료된 계약만 리뷰 가능)
    if (contract.status !== 'completed') {
      return res.status(400).json({ error: '완료된 계약서만 리뷰를 작성할 수 있습니다.' });
    }

    // 이미 리뷰가 있는지 확인
    const existingReview = await Review.findByContractId(contract_id);
    if (existingReview.length > 0) {
      return res.status(400).json({ error: '이미 리뷰가 작성되었습니다.' });
    }

    const review = await Review.create({
      contract_id,
      user_id: req.user.id,
      rating,
      title,
      content,
      service_quality,
      communication,
      timeliness,
      images,
    });

    res.status(201).json({
      message: '리뷰가 작성되었습니다.',
      review,
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: '리뷰 작성에 실패했습니다.' });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const reviews = await Review.findByUserId(req.user.id, { limit, offset });
    res.json({ reviews });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ error: '리뷰 조회에 실패했습니다.' });
  }
};

const getContractReviews = async (req, res) => {
  try {
    const { contract_id } = req.params;
    const reviews = await Review.findByContractId(contract_id);
    res.json({ reviews });
  } catch (error) {
    console.error('Get contract reviews error:', error);
    res.status(500).json({ error: '리뷰 조회에 실패했습니다.' });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const { limit, offset, rating, is_verified } = req.query;
    const reviews = await Review.findAll({ limit, offset, rating, is_verified });
    res.json({ reviews });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ error: '리뷰 조회에 실패했습니다.' });
  }
};

const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ error: '리뷰를 찾을 수 없습니다.' });
    }

    res.json({ review });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ error: '리뷰 조회에 실패했습니다.' });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ error: '리뷰를 찾을 수 없습니다.' });
    }

    // 권한 확인 (본인만 수정 가능)
    if (review.user_id !== req.user.id) {
      return res.status(403).json({ error: '수정 권한이 없습니다.' });
    }

    const updatedReview = await Review.update(id, updates);

    res.json({
      message: '리뷰가 업데이트되었습니다.',
      review: updatedReview,
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: '리뷰 업데이트에 실패했습니다.' });
  }
};

const verifyReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.verify(id);

    res.json({
      message: '리뷰가 검증되었습니다.',
      review,
    });
  } catch (error) {
    console.error('Verify review error:', error);
    res.status(500).json({ error: '리뷰 검증에 실패했습니다.' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ error: '리뷰를 찾을 수 없습니다.' });
    }

    // 권한 확인 (본인 또는 관리자만 삭제 가능)
    if (review.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }

    await Review.delete(id);

    res.json({
      message: '리뷰가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: '리뷰 삭제에 실패했습니다.' });
  }
};

const getReviewStats = async (req, res) => {
  try {
    const averageRating = await Review.getAverageRating();
    const ratingDistribution = await Review.getRatingDistribution();
    const totalReviews = await Review.getCount({ is_verified: true });

    res.json({
      stats: {
        total_reviews: totalReviews,
        average_rating: averageRating,
        rating_distribution: ratingDistribution,
      },
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({ error: '리뷰 통계 조회에 실패했습니다.' });
  }
};

module.exports = {
  createReview,
  getMyReviews,
  getContractReviews,
  getAllReviews,
  getReviewById,
  updateReview,
  verifyReview,
  deleteReview,
  getReviewStats,
};
