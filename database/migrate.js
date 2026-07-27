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

// 마이그레이션 실행 함수
async function migrate() {
  const client = await pool.connect();

  try {
    console.log('데이터베이스 마이그레이션 시작...');

    // 스키마 파일 읽기
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // 트랜잭션 시작
    await client.query('BEGIN');

    // 스키마 실행
    await client.query(schemaSQL);
    console.log('스키마 마이그레이션 완료');

    // 시드 데이터가 필요한 경우 실행
    const args = process.argv.slice(2);
    if (args.includes('--seed')) {
      const seedPath = path.join(__dirname, 'seed.sql');
      const seedSQL = fs.readFileSync(seedPath, 'utf8');
      await client.query(seedSQL);
      console.log('시드 데이터 마이그레이션 완료');
    }

    // 트랜잭션 커밋
    await client.query('COMMIT');
    console.log('마이그레이션 성공적으로 완료되었습니다.');

  } catch (error) {
    // 에러 발생 시 롤백
    await client.query('ROLLBACK');
    console.error('마이그레이션 실패:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// 스크립트 실행
migrate()
  .then(() => {
    console.log('마이그레이션 프로세스 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('마이그레이션 프로세스 실패:', error);
    process.exit(1);
  });
