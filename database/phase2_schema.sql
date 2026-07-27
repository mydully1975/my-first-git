-- 2단계: 결제 및 계약 시스템 데이터베이스 스키마 확장
-- PostgreSQL

-- 계약서 테이블
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    signed_at TIMESTAMP,
    contract_pdf_url VARCHAR(500),
    start_date DATE,
    end_date DATE,
    total_amount DECIMAL(10, 2) NOT NULL,
    terms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 결제 테이블
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_type VARCHAR(20) NOT NULL DEFAULT 'full' CHECK (payment_type IN ('full', 'deposit', 'balance')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
    transaction_id VARCHAR(100),
    pg_transaction_id VARCHAR(100),
    pg_response JSONB,
    paid_at TIMESTAMP,
    refund_amount DECIMAL(10, 2),
    refund_reason TEXT,
    refunded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_contracts_quote ON contracts(quote_id);
CREATE INDEX idx_contracts_user ON contracts(user_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_number ON contracts(contract_number);
CREATE INDEX idx_payments_contract ON payments(contract_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_pg_transaction ON payments(pg_transaction_id);

-- updated_at 자동 업데이트 트리거 적용
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 계약서 번호 생성 함수
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS VARCHAR AS $$
DECLARE
    contract_num VARCHAR;
    date_str VARCHAR;
    seq_num INTEGER;
BEGIN
    date_str := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(contract_number FROM 10) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM contracts
    WHERE contract_number LIKE 'CONTRACT-' || date_str || '%';
    
    contract_num := 'CONTRACT-' || date_str || LPAD(seq_num::TEXT, 4, '0');
    
    RETURN contract_num;
END;
$$ LANGUAGE plpgsql;