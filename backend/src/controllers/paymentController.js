const Payment = require('../models/Payment');
const Contract = require('../models/Contract');
const User = require('../models/User');
const Quote = require('../models/Quote');
const pgService = require('../services/pgService');
const { auth, adminAuth } = require('../middleware/auth');

const preparePayment = async (req, res) => {
  try {
    const { contract_id, payment_method, payment_type = 'full' } = req.body;

    // 계약서 확인
    const contract = await Contract.findById(contract_id);
    if (!contract) {
      return res.status(404).json({ error: '계약서를 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (contract.user_id !== req.user.id) {
      return res.status(403).json({ error: '결제 권한이 없습니다.' });
    }

    // 계약서 상태 확인
    if (contract.status !== 'pending') {
      return res.status(400).json({ error: '결제 가능한 계약서가 아닙니다.' });
    }

    // 사용자 정보 조회
    const user = await User.findById(req.user.id);

    // 결제 금액 계산
    let amount = contract.total_amount;
    if (payment_type === 'deposit') {
      amount = contract.total_amount * 0.3; // 계약금 30%
    } else if (payment_type === 'balance') {
      amount = contract.total_amount * 0.7; // 잔금 70%
    }

    // 결제 준비 데이터 생성
    const paymentData = pgService.preparePayment({
      contract_id,
      amount,
      order_name: `계약서 ${contract.contract_number}`,
      buyer_name: user.name,
      buyer_email: user.email,
      buyer_tel: user.phone,
      return_url: `${process.env.APP_URL}/api/payments/complete`,
    });

    // 결제 요청 생성
    const transaction_id = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payment = await Payment.create({
      contract_id,
      amount,
      payment_method,
      payment_type,
      transaction_id,
    });

    res.json({
      message: '결제 준비가 완료되었습니다.',
      payment: {
        id: payment.id,
        transaction_id: payment.transaction_id,
        amount: payment.amount,
        payment_method: payment.payment_method,
        payment_type: payment.payment_type,
      },
      pg_data: paymentData,
    });
  } catch (error) {
    console.error('Prepare payment error:', error);
    res.status(500).json({ error: '결제 준비에 실패했습니다.' });
  }
};

const completePayment = async (req, res) => {
  try {
    const { transaction_id, pg_transaction_id, pg_response } = req.body;

    // 결제 요청 확인
    const payment = await Payment.findByTransactionId(transaction_id);
    if (!payment) {
      return res.status(404).json({ error: '결제 요청을 찾을 수 없습니다.' });
    }

    // PG사 결제 검증
    const verification = await pgService.verifyPayment(pg_transaction_id, payment.amount);

    if (!verification.success) {
      await Payment.failPayment(payment.id, verification);
      return res.status(400).json({ error: '결제 검증에 실패했습니다.' });
    }

    // 결제 완료 처리
    const completedPayment = await Payment.completePayment(
      payment.id,
      pg_transaction_id,
      pg_response || verification
    );

    // 계약서 상태 업데이트 (전액 결제 시)
    if (payment.payment_type === 'full') {
      await Contract.sign(payment.contract_id);
    }

    res.json({
      message: '결제가 완료되었습니다.',
      payment: completedPayment,
    });
  } catch (error) {
    console.error('Complete payment error:', error);
    res.status(500).json({ error: '결제 완료 처리에 실패했습니다.' });
  }
};

const getMyPayments = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const payments = await Payment.findByUserId(req.user.id, { limit, offset });
    res.json({ payments });
  } catch (error) {
    console.error('Get my payments error:', error);
    res.status(500).json({ error: '결제 내역 조회에 실패했습니다.' });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const { limit, offset, status } = req.query;
    const payments = await Payment.findAll({ limit, offset, status });
    res.json({ payments });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ error: '결제 내역 조회에 실패했습니다.' });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ error: '결제 내역을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (payment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '조회 권한이 없습니다.' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: '결제 내역 조회에 실패했습니다.' });
  }
};

const refundPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { refund_reason } = req.body;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ error: '결제 내역을 찾을 수 없습니다.' });
    }

    // 권한 확인: 관리자만 환불 가능
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '환불 권한이 없습니다.' });
    }

    // 상태 확인
    if (payment.status !== 'completed') {
      return res.status(400).json({ error: '완료된 결제만 환불할 수 있습니다.' });
    }

    // 이미 환불된 결제인지 확인
    if (payment.status === 'refunded') {
      return res.status(400).json({ error: '이미 환불된 결제입니다.' });
    }

    // PG사 환불 요청
    const refundResult = await pgService.requestRefund({
      pg_transaction_id: payment.pg_transaction_id,
      amount: payment.amount,
      reason: refund_reason,
      cancel_reason: refund_reason,
    });

    if (!refundResult.success) {
      return res.status(400).json({ error: '환불 요청에 실패했습니다.' });
    }

    // 환불 처리
    const refundedPayment = await Payment.refund(
      payment.id,
      payment.amount,
      refund_reason
    );

    res.json({
      message: '환불이 완료되었습니다.',
      payment: refundedPayment,
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({ error: '환불에 실패했습니다.' });
  }
};

const getPaymentStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const totalRevenue = await Payment.getTotalRevenue({
      startDate: start_date,
      endDate: end_date,
    });

    const totalRefund = await Payment.getRefundTotal({
      startDate: start_date,
      endDate: end_date,
    });

    const netRevenue = totalRevenue - totalRefund;

    const completedCount = await Payment.getCount({ status: 'completed' });
    const refundedCount = await Payment.getCount({ status: 'refunded' });
    const pendingCount = await Payment.getCount({ status: 'pending' });

    res.json({
      stats: {
        total_revenue: totalRevenue,
        total_refund: totalRefund,
        net_revenue: netRevenue,
        completed_count: completedCount,
        refunded_count: refundedCount,
        pending_count: pendingCount,
      },
      period: {
        start_date,
        end_date,
      },
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ error: '결제 통계 조회에 실패했습니다.' });
  }
};

module.exports = {
  preparePayment,
  completePayment,
  getMyPayments,
  getAllPayments,
  getPaymentById,
  refundPayment,
  getPaymentStats,
};