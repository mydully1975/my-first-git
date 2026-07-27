const crypto = require('crypto');

class PGService {
  constructor() {
    // PG사 설정 (환경변수에서 로드)
    this.mid = process.env.PG_MID || 'INIpayTest'; // 상점아이디
    this.mKey = process.env.PG_MKEY || 'SU5JTElOTVZJTlA='; // 상점키
    this.licenseKey = process.env.PG_LICENSE_KEY || '';
    this.apiUrl = process.env.PG_API_URL || 'https://stdpay.inicis.com/stdpay/iniPayReq.do';
    this.cancelUrl = process.env.PG_CANCEL_URL || 'https://stdpay.inicis.com/stdpay/cancel.do';
  }

  /**
   * 결제 준비 데이터 생성
   */
  preparePayment({
    contract_id,
    amount,
    order_id,
    order_name,
    buyer_name,
    buyer_email,
    buyer_tel,
    return_url,
  }) {
    const timestamp = new Date().getTime();
    const oid = order_id || `ORDER_${contract_id}_${timestamp}`;
    const price = amount.toString();

    const data = {
      mid: this.mid,
      oid: oid,
      price: price,
      mname: '견적서비스',
      buyername: buyer_name,
      buyertel: buyer_tel,
      buyeremail: buyer_email,
      goodname: order_name || '서비스 계약',
      returnURL: return_url,
    };

    return data;
  }

  /**
   * 결제 요청 데이터 암호화
   */
  encryptPaymentData(data) {
    const timestamp = new Date().getTime();
    const signature = this.generateSignature(data, timestamp);

    return {
      ...data,
      timestamp: timestamp,
      signature: signature,
    };
  }

  /**
   * 서명 생성
   */
  generateSignature(data, timestamp) {
    const hashData = `${this.mid}${data.oid}${data.price}${timestamp}`;
    return crypto.createHash('sha256').update(hashData).digest('hex');
  }

  /**
   * 결제 검증
   */
  async verifyPayment(pg_transaction_id, amount) {
    try {
      // 실제 PG사 API 호출을 통한 검증
      // 이 부분은 실제 PG사 연동 시 구현 필요
      const mockResponse = {
        success: true,
        pg_transaction_id: pg_transaction_id,
        amount: amount,
        status: 'completed',
      };

      return mockResponse;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw new Error('결제 검증에 실패했습니다.');
    }
  }

  /**
   * 환불 요청
   */
  async requestRefund({
    pg_transaction_id,
    amount,
    reason,
    cancel_reason,
  }) {
    try {
      // 실제 PG사 API 호출을 통한 환불
      // 이 부분은 실제 PG사 연동 시 구현 필요
      const mockResponse = {
        success: true,
        refund_id: `REFUND_${Date.now()}`,
        amount: amount,
        status: 'refunded',
      };

      return mockResponse;
    } catch (error) {
      console.error('Refund request error:', error);
      throw new Error('환불 요청에 실패했습니다.');
    }
  }

  /**
   * 결제 상태 조회
   */
  async getPaymentStatus(pg_transaction_id) {
    try {
      // 실제 PG사 API 호출을 통한 상태 조회
      // 이 부분은 실제 PG사 연동 시 구현 필요
      const mockResponse = {
        pg_transaction_id: pg_transaction_id,
        status: 'completed',
        amount: 100000,
        paid_at: new Date().toISOString(),
      };

      return mockResponse;
    } catch (error) {
      console.error('Payment status check error:', error);
      throw new Error('결제 상태 조회에 실패했습니다.');
    }
  }

  /**
   * 카드 결제 준비 (KG이니시스)
   */
  prepareCardPayment({ contract_id, amount, buyer_info, return_url }) {
    const timestamp = new Date().getTime();
    const oid = `CARD_${contract_id}_${timestamp}`;
    const price = amount.toString();

    const data = {
      mid: this.mid,
      oid: oid,
      price: price,
      currency: 'KRW',
      goodname: '서비스 계약',
      buyername: buyer_info.name,
      buyertel: buyer_info.phone,
      buyeremail: buyer_info.email,
      returnURL: return_url,
      timestamp: timestamp,
      signature: this.generateSignature({ mid: this.mid, oid, price }, timestamp),
      payMethod: 'CARD',
    };

    return data;
  }

  /**
   * 계좌이체 준비
   */
  prepareBankPayment({ contract_id, amount, buyer_info, return_url }) {
    const timestamp = new Date().getTime();
    const oid = `BANK_${contract_id}_${timestamp}`;
    const price = amount.toString();

    const data = {
      mid: this.mid,
      oid: oid,
      price: price,
      currency: 'KRW',
      goodname: '서비스 계약',
      buyername: buyer_info.name,
      buyertel: buyer_info.phone,
      buyeremail: buyer_info.email,
      returnURL: return_url,
      timestamp: timestamp,
      signature: this.generateSignature({ mid: this.mid, oid, price }, timestamp),
      payMethod: 'BANK',
    };

    return data;
  }

  /**
   * 간편결제 준비 (카카오페이, 네이버페이 등)
   */
  prepareEasyPayment({ contract_id, amount, buyer_info, return_url, pay_method }) {
    const timestamp = new Date().getTime();
    const oid = `EASY_${pay_method}_${contract_id}_${timestamp}`;
    const price = amount.toString();

    const data = {
      mid: this.mid,
      oid: oid,
      price: price,
      currency: 'KRW',
      goodname: '서비스 계약',
      buyername: buyer_info.name,
      buyertel: buyer_info.phone,
      buyeremail: buyer_info.email,
      returnURL: return_url,
      timestamp: timestamp,
      signature: this.generateSignature({ mid: this.mid, oid, price }, timestamp),
      payMethod: pay_method, // 'KAKAO', 'NAVER', 'PAYCO'
    };

    return data;
  }
}

module.exports = new PGService();