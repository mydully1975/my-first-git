const Contract = require('../models/Contract');
const Quote = require('../models/Quote');
const QuoteRequest = require('../models/QuoteRequest');
const { auth, adminAuth } = require('../middleware/auth');

const createContract = async (req, res) => {
  try {
    const { quote_id, terms, start_date, end_date } = req.body;

    // 견적서 확인
    const quote = await Quote.findById(quote_id);
    if (!quote) {
      return res.status(404).json({ error: '견적서를 찾을 수 없습니다.' });
    }

    // 견적서 상태 확인
    if (quote.status !== 'approved') {
      return res.status(400).json({ error: '승인된 견적서만 계약서를 생성할 수 있습니다.' });
    }

    // 이미 계약서가 있는지 확인
    const existingContract = await Contract.findByQuoteId(quote_id);
    if (existingContract) {
      return res.status(400).json({ error: '이미 계약서가 존재합니다.' });
    }

    // 계약서 생성
    const contract = await Contract.create({
      quote_id,
      user_id: req.user.id,
      total_amount: quote.total_amount,
      terms,
      start_date,
      end_date,
    });

    res.status(201).json({
      message: '계약서가 생성되었습니다.',
      contract,
    });
  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({ error: '계약서 생성에 실패했습니다.' });
  }
};

const getMyContracts = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const contracts = await Contract.findByUserId(req.user.id, { limit, offset });
    res.json({ contracts });
  } catch (error) {
    console.error('Get my contracts error:', error);
    res.status(500).json({ error: '계약서 조회에 실패했습니다.' });
  }
};

const getAllContracts = async (req, res) => {
  try {
    const { limit, offset, status } = req.query;
    const contracts = await Contract.findAll({ limit, offset, status });
    res.json({ contracts });
  } catch (error) {
    console.error('Get all contracts error:', error);
    res.status(500).json({ error: '계약서 조회에 실패했습니다.' });
  }
};

const getContractById = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({ error: '계약서를 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (contract.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '조회 권한이 없습니다.' });
    }

    res.json({ contract });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({ error: '계약서 조회에 실패했습니다.' });
  }
};

const signContract = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({ error: '계약서를 찾을 수 없습니다.' });
    }

    // 권한 확인: 본인만 서명 가능
    if (contract.user_id !== req.user.id) {
      return res.status(403).json({ error: '서명 권한이 없습니다.' });
    }

    // 상태 확인
    if (contract.status !== 'pending') {
      return res.status(400).json({ error: '이미 처리된 계약서입니다.' });
    }

    // 계약서 서명
    const signedContract = await Contract.sign(id);

    // TODO: 계약서 PDF 생성 및 저장

    res.json({
      message: '계약서가 서명되었습니다.',
      contract: signedContract,
    });
  } catch (error) {
    console.error('Sign contract error:', error);
    res.status(500).json({ error: '계약서 서명에 실패했습니다.' });
  }
};

const updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({ error: '계약서를 찾을 수 없습니다.' });
    }

    // 권한 확인: 관리자만 수정 가능
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '수정 권한이 없습니다.' });
    }

    // 이미 서명된 계약서는 수정 불가
    if (contract.status !== 'pending') {
      return res.status(400).json({ error: '이미 서명된 계약서는 수정할 수 없습니다.' });
    }

    const updatedContract = await Contract.update(id, updates);

    res.json({
      message: '계약서가 업데이트되었습니다.',
      contract: updatedContract,
    });
  } catch (error) {
    console.error('Update contract error:', error);
    res.status(500).json({ error: '계약서 업데이트에 실패했습니다.' });
  }
};

const cancelContract = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({ error: '계약서를 찾을 수 없습니다.' });
    }

    // 권한 확인: 본인 또는 관리자만 취소 가능
    if (contract.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '취소 권한이 없습니다.' });
    }

    // 상태 확인
    if (contract.status === 'completed' || contract.status === 'cancelled') {
      return res.status(400).json({ error: '이미 완료되거나 취소된 계약서입니다.' });
    }

    const cancelledContract = await Contract.updateStatus(id, 'cancelled');

    res.json({
      message: '계약서가 취소되었습니다.',
      contract: cancelledContract,
    });
  } catch (error) {
    console.error('Cancel contract error:', error);
    res.status(500).json({ error: '계약서 취소에 실패했습니다.' });
  }
};

const completeContract = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({ error: '계약서를 찾을 수 없습니다.' });
    }

    // 권한 확인: 관리자만 완료 처리 가능
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '완료 권한이 없습니다.' });
    }

    // 상태 확인
    if (contract.status !== 'active') {
      return res.status(400).json({ error: '활성 상태의 계약서만 완료할 수 있습니다.' });
    }

    const completedContract = await Contract.updateStatus(id, 'completed');

    res.json({
      message: '계약이 완료되었습니다.',
      contract: completedContract,
    });
  } catch (error) {
    console.error('Complete contract error:', error);
    res.status(500).json({ error: '계약 완료에 실패했습니다.' });
  }
};

module.exports = {
  createContract,
  getMyContracts,
  getAllContracts,
  getContractById,
  signContract,
  updateContract,
  cancelContract,
  completeContract,
};