const QuoteRequest = require('../models/QuoteRequest');
const Attachment = require('../models/Attachment');
const { auth, adminAuth } = require('../middleware/auth');

const createQuoteRequest = async (req, res) => {
  try {
    const { category_id, title, description, requirements, budget_min, budget_max, preferred_date } = req.body;

    const quoteRequest = await QuoteRequest.create({
      user_id: req.user.id,
      category_id,
      title,
      description,
      requirements,
      budget_min,
      budget_max,
      preferred_date,
    });

    res.status(201).json({
      message: '견적요청이 생성되었습니다.',
      quoteRequest,
    });
  } catch (error) {
    console.error('Create quote request error:', error);
    res.status(500).json({ error: '견적요청 생성에 실패했습니다.' });
  }
};

const getMyQuoteRequests = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const quoteRequests = await QuoteRequest.findByUserId(req.user.id, { limit, offset });
    res.json({ quoteRequests });
  } catch (error) {
    console.error('Get my quote requests error:', error);
    res.status(500).json({ error: '견적요청 조회에 실패했습니다.' });
  }
};

const getAllQuoteRequests = async (req, res) => {
  try {
    const { limit, offset, status, category_id } = req.query;
    const quoteRequests = await QuoteRequest.findAll({ limit, offset, status, category_id });
    res.json({ quoteRequests });
  } catch (error) {
    console.error('Get all quote requests error:', error);
    res.status(500).json({ error: '견적요청 조회에 실패했습니다.' });
  }
};

const getQuoteRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const quoteRequest = await QuoteRequest.findById(id);

    if (!quoteRequest) {
      return res.status(404).json({ error: '견적요청을 찾을 수 없습니다.' });
    }

    // 권한 확인: 본인 또는 관리자만 조회 가능
    if (quoteRequest.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '조회 권한이 없습니다.' });
    }

    // 첨부파일 조회
    const attachments = await Attachment.findByRequestId(id);
    quoteRequest.attachments = attachments;

    res.json({ quoteRequest });
  } catch (error) {
    console.error('Get quote request error:', error);
    res.status(500).json({ error: '견적요청 조회에 실패했습니다.' });
  }
};

const updateQuoteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const quoteRequest = await QuoteRequest.findById(id);

    if (!quoteRequest) {
      return res.status(404).json({ error: '견적요청을 찾을 수 없습니다.' });
    }

    // 권한 확인: 본인만 수정 가능 (단, 상태는 관리자도 수정 가능)
    if (quoteRequest.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '수정 권한이 없습니다.' });
    }

    // 견적이 시작된 상태에서는 수정 불가
    if (quoteRequest.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({ error: '이미 견적이 진행 중인 요청은 수정할 수 없습니다.' });
    }

    const updatedRequest = await QuoteRequest.update(id, updates);

    res.json({
      message: '견적요청이 업데이트되었습니다.',
      quoteRequest: updatedRequest,
    });
  } catch (error) {
    console.error('Update quote request error:', error);
    res.status(500).json({ error: '견적요청 업데이트에 실패했습니다.' });
  }
};

const updateQuoteRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const quoteRequest = await QuoteRequest.updateStatus(id, status);

    if (!quoteRequest) {
      return res.status(404).json({ error: '견적요청을 찾을 수 없습니다.' });
    }

    res.json({
      message: '견적요청 상태가 업데이트되었습니다.',
      quoteRequest,
    });
  } catch (error) {
    console.error('Update quote request status error:', error);
    res.status(500).json({ error: '상태 업데이트에 실패했습니다.' });
  }
};

const deleteQuoteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const quoteRequest = await QuoteRequest.findById(id);

    if (!quoteRequest) {
      return res.status(404).json({ error: '견적요청을 찾을 수 없습니다.' });
    }

    // 권한 확인: 본인만 삭제 가능
    if (quoteRequest.user_id !== req.user.id) {
      return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }

    // 견적이 진행 중인 상태에서는 삭제 불가
    if (quoteRequest.status !== 'pending') {
      return res.status(400).json({ error: '이미 견적이 진행 중인 요청은 삭제할 수 없습니다.' });
    }

    await QuoteRequest.delete(id);

    res.json({
      message: '견적요청이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete quote request error:', error);
    res.status(500).json({ error: '견적요청 삭제에 실패했습니다.' });
  }
};

module.exports = {
  createQuoteRequest,
  getMyQuoteRequests,
  getAllQuoteRequests,
  getQuoteRequestById,
  updateQuoteRequest,
  updateQuoteRequestStatus,
  deleteQuoteRequest,
};