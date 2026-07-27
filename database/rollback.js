const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 데이터베이스 연결 설정
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'quote_service',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// 롤백 실행 함수
async function rollback() {
  const client = await pool.connect();

  try {
    console.log('데이터베이스 롤백 시작...');

    // 롤백 스크립트 파일 읽기
    const rollbackPath = path.join(__dirname, 'rollback.sql');
    const rollbackSQL = fs.readFileSync(rollbackPath, 'utf8');

    // 트랜잭션 시작
    await client.query('BEGIN');

    // 롤백 스크립트 실행
    await client.query(rollbackSQL);
    console.log('롤백 스크립트 실행 완료');

    // 트랜잭션 커밋
    await client.query('COMMIT');
    console.log('롤백이 성공적으로 완료되었습니다.');

  } catch (error) {
    // 에러 발생 시 롤백
    await client.query('ROLLBACK');
    console.error('롤백 실패:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// 스크립트 실행
rollback()
  .then(() => {
    console.log('롤백 프로세스 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('롤백 프로세스 실패:', error);
    process.exit(1);
  });
