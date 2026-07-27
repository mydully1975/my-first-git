-- 롤백 스크립트
-- 데이터베이스 초기화 및 롤백용

-- 트리거 삭제
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_quote_requests_updated_at ON quote_requests;
DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
DROP TRIGGER IF EXISTS update_schedules_updated_at ON schedules;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON chat_rooms;
DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON chat_messages;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
DROP TRIGGER IF EXISTS update_push_tokens_updated_at ON push_tokens;

-- 트리거 함수 삭제
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 인덱스 삭제
DROP INDEX IF EXISTS idx_push_tokens_token;
DROP INDEX IF EXISTS idx_push_tokens_user_id;
DROP INDEX IF EXISTS idx_notifications_is_read;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_chat_messages_sender_id;
DROP INDEX IF EXISTS idx_chat_messages_chat_room_id;
DROP INDEX IF EXISTS idx_chat_rooms_user_id;
DROP INDEX IF EXISTS idx_chat_rooms_contract_id;
DROP INDEX IF EXISTS idx_reviews_rating;
DROP INDEX IF EXISTS idx_reviews_user_id;
DROP INDEX IF EXISTS idx_reviews_contract_id;
DROP INDEX IF EXISTS idx_schedules_status;
DROP INDEX IF EXISTS idx_schedules_assigned_to;
DROP INDEX IF EXISTS idx_schedules_contract_id;
DROP INDEX IF EXISTS idx_payments_status;
DROP INDEX IF EXISTS idx_payments_user_id;
DROP INDEX IF EXISTS idx_payments_contract_id;
DROP INDEX IF EXISTS idx_contracts_contract_number;
DROP INDEX IF EXISTS idx_contracts_user_id;
DROP INDEX IF EXISTS idx_contracts_quote_id;
DROP INDEX IF EXISTS idx_quotes_admin_id;
DROP INDEX IF EXISTS idx_quotes_quote_request_id;
DROP INDEX IF EXISTS idx_quote_requests_category_id;
DROP INDEX IF EXISTS idx_quote_requests_status;
DROP INDEX IF EXISTS idx_quote_requests_user_id;
DROP INDEX IF EXISTS idx_users_email;

-- 테이블 삭제 (외래키 관계 고려하여 역순으로 삭제)
DROP TABLE IF EXISTS push_tokens;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_rooms;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS quote_requests;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
