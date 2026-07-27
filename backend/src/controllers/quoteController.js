const Quote = require('../models/Quote');
const QuoteRequest = require('../models/QuoteRequest');
const QuoteCalculator = require('../services/quoteCalculator');
const { auth, adminAuth } = require('../middleware/auth');

const createQuote = async (req, res) => {
  try {
    const { quote_request_id, notes } = req.body;

    // 견적요청 확인
    const quoteRequest = await QuoteRequest.findById(quote_request_id);
    if (!quoteRequest) {
      return res.status(404).json({ error: '견적요청을 찾을 수 없습니다.' });
    }

    // 자동 견적 계산
    const calculatedQuote = await QuoteCalculator.calculateQuote(quote_request_id);

    // 견적서 생성
    const quote = await Quote.create({
      quote_request_id,
      admin_id: req.user.id,
      total_amount: calculatedQuote.total_amount,
      breakdown: calculatedQuote.breakdown,
      valid_until: calculatedQuote.valid_until,
      notes,
    });

    // 견적요청 상태 업데이트
    await QuoteRequest.updateStatus(quote_request_id, 'quoting');

    res.status(201).json({
      message: '견적서가 생성되었습니다.',
      quote,
    });
  } catch (error) {
    console.error('Create quote error:', error);
    res.status(500).json({ error: '견적서 생성에 실패했습니다.' });
  }
};

const getQuotesByRequestId = async (req, res) => {
  try {
    const { request_id } = req.params;
    const quotes = await Quote.findByRequestId(request_id);

    // 권한 확인
    const quoteRequest = await QuoteRequest.findById(request_id);
    if (quoteRequest.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '조회 권한이 없습니다.' });
    }

    res.json({ quotes });
  } catch (error) {
    console.error('Get quotes by request error:', error);
    res.status(500).json({ error: '견적서 조회에 실패했습니다.' });
  }
};

const getQuoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findById(id);

    if (!quote) {
      return res.status(404).json({ error: '견적서를 찾을 수 없습니다.' });
    }

    // 권한 확인
    const quoteRequest = await QuoteRequest.findById(quote.quote_request_id);
    if (quoteRequest.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '조회 권한이 없습니다.' });
    }

    res.json({ quote });
  } catch (error) {
    console.error('Get quote error:', error);
    res.status(500).json({ error: '견적서 조회에 실패했습니다.' });
  }
};

const updateQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { total_amount, breakdown, valid_until, notes } = req.body;

    const quote = await Quote.findById(id);

    if (!quote) {
      return res.status(404).json({ error: '견적서를 찾을 수 없습니다.' });
    }

    // 권한 확인: 관리자만 수정 가능
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '수정 권한이 없습니다.' });
    }

    // 이미 발송된 견적서는 수정 불가
    if (quote.status === 'sent' || quote.status === 'approved') {
      return res.status(400).json({ error: '이미 발송된 견적서는 수정할 수 없습니다.' });
    }

    const updates = {};
    if (total_amount !== undefined) updates.total_amount = total_amount;
    if (breakdown !== undefined) updates.breakdown = breakdown;
    if (valid_until !== undefined) updates.valid_until = valid_until;
    if (notes !== undefined) updates.notes = notes;

    const updatedQuote = await Quote.update(id, updates);

    res.json({
      message: '견적서가 업데이트되었습니다.',
      quote: updatedQuote,
    });
  } catch (error) {
    console.error('Update quote error:', error);
    res.status(500).json({ error: '견적서 업데이트에 실패했습니다.' });
  }
};

const sendQuote = async (req, res) => {
  try {
    const { id } = req.params;

    const quote = await Quote.findById(id);

    if (!quote) {
      return res.status(404).json({ error: '견적서를 찾을 수 없습니다.' });
    }

    // 권한 확인: 관리자만 발송 가능
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '발송 권한이 없습니다.' });
    }

    // 상태 확인
    if (quote.status !== 'draft') {
      return res.status(400).json({ error: '초안 상태의 견적서만 발송할 수 있습니다.' });
    }

    // 견적서 발송 (상태 변경)
    const updatedQuote = await Quote.updateStatus(id, 'sent');

    // TODO: 푸시 알림 또는 이메일 발송 로직 추가

    res.json({
      message: '견적서가 발송되었습니다.',
      quote: updatedQuote,
    });
  } catch (error) {
    console.error('Send quote error:', error);
    res.status(500).json({ error: '견적서 발송에 실패했습니다.' });
  }
};

const approveQuote = async (req, res) => {
  try {
    const { id } = req.params;

    const quote = await Quote.findById(id);

    if (!quote) {
      return res.status(404).json({ error: '견적서를 찾을 수 없습니다.' });
    }

    // 권한 확인: 견적요청자만 승인 가능
    const quoteRequest = await QuoteRequest.findById(quote.quote_request_id);
    if (quoteRequest.user_id !== req.user.id) {
      return res.status(403).json({ error: '승인 권한이 없습니다.' });
    }

    // 상태 확인
    if (quote.status !== 'sent') {
      return res.status(400).json({ error: '발송된 견적서만 승인할 수 있습니다.' });
    }

    // 유효기간 확인
    if (quote.valid_until && new Date(quote.valid_until) < new Date()) {
      return res.status(400).json({ error: '유효기간이 만료된 견적서입니다.' });
    }

    // 견적서 승인
    const updatedQuote = await Quote.updateStatus(id, 'approved');

    // 견적요청 상태 업데이트
    await QuoteRequest.updateStatus(quote.quote_request_id, 'completed');

    // TODO: 계약서 생성 로직 추가 (Phase 2)

    res.json({
      message: '견적서가 승인되었습니다.',
      quote: updatedQuote,
    });
  } catch (error) {
    console.error('Approve quote error:', error);
    res.status(500).json({ error: '견적서 승인에 실패했습니다.' });
  }
};

const rejectQuote = async (req, res) => {
  try {
    const { id } = req.params;

    const quote = await Quote.findById(id);

    if (!quote) {
      return res.status(404).json({ error: '견적서를 찾을 수 없습니다.' });
    }

    // 권한 확인: 견적요청자만 거절 가능
    const quoteRequest = await QuoteRequest.findById(quote.quote_request_id);
    if (quoteRequest.user_id !== req.user.id) {
      return res.status(403).json({ error: '거절 권한이 없습니다.' });
    }

    // 상태 확인
    if (quote.status !== 'sent') {
      return res.status(400).json({ error: '발송된 견적서만 거절할 수 있습니다.' });
    }

    // 견적서 거절
    const updatedQuote = await Quote.updateStatus(id, 'rejected');

    res.json({
      message: '견적서가 거절되었습니다.',
      quote: updatedQuote,
    });
  } catch (error) {
    console.error('Reject quote error:', error);
    res.status(500).json({ error: '견적서 거절에 실패했습니다.' });
  }
};

const getAllQuotes = async (req, res) => {
  try {
    const { limit, offset, status } = req.query;
    const quotes = await Quote.findAll({ limit, offset, status });
    res.json({ quotes });
  } catch (error) {
    console.error('Get all quotes error:', error);
    res.status(500).json({ error: '견적서 조회에 실패했습니다.' });
  }
};

const deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;

    const quote = await Quote.findById(id);

    if (!quote) {
      return res.status(404).json({ error: '견적서를 찾을 수 없습니다.' });
    }

    // 권한 확인: 관리자만 삭제 가능
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }

    // 이미 발송된 견적서는 삭제 불가
    if (quote.status !== 'draft') {
      return res.status(400).json({ error: '이미 발송된 견적서는 삭제할 수 없습니다.' });
    }

    await Quote.delete(id);

    res.json({
      message: '견적서가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete quote error:', error);
    res.status(500).json({ error: '견적서 삭제에 실패했습니다.' });
  }
};

module.exports = {
  createQuote,
  getQuotesByRequestId,
  getQuoteById,
  updateQuote,
  sendQuote,
  approveQuote,
  rejectQuote,
  getAllQuotes,
  deleteQuote,
};