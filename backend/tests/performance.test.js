const autocannon = require('autocannon');
const { PassThrough } = require('stream');

// API 부하 테스트
async function runLoadTest() {
  const instance = autocannon({
    url: 'http://localhost:3000',
    connections: 100, // 동시 연결 수
    duration: 30, // 테스트 지속 시간 (초)
    amount: 1000, // 총 요청 수
    requests: [
      {
        method: 'GET',
        path: '/api/quotes/requests'
      },
      {
        method: 'GET',
        path: '/api/categories'
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test123!'
        })
      }
    ]
  }, PassThrough());

  autocannon.track(instance, { renderProgressBar: true });

  instance.on('done', (result) => {
    console.log('부하 테스트 결과:');
    console.log(`총 요청 수: ${result.requests.mean}`);
    console.log(`초당 요청 수 (RPS): ${result.requests.mean}`);
    console.log(`평균 응답 시간: ${result.latency.mean}ms`);
    console.log(`최소 응답 시간: ${result.latency.min}ms`);
    console.log(`최대 응답 시간: ${result.latency.max}ms`);
    console.log(`오류율: ${result.errors}%`);
    console.log(`시간아웃: ${result.timeouts}`);

    // 성능 기준 확인
    if (result.latency.mean < 200) {
      console.log('✅ 평균 응답 시간 기준 충족 (200ms 이하)');
    } else {
      console.log('❌ 평균 응답 시간 기준 미달');
    }

    if (result.errors < 1) {
      console.log('✅ 오류율 기준 충족 (1% 미만)');
    } else {
      console.log('❌ 오류율 기준 미달');
    }
  });
}

// 데이터베이스 부하 테스트
async function runDatabaseLoadTest() {
  const db = require('../src/config/database');

  console.log('데이터베이스 부하 테스트 시작...');

  try {
    // 동시 쿼리 실행 테스트
    const queryPromises = [];
    const queryCount = 100;

    for (let i = 0; i < queryCount; i++) {
      queryPromises.push(
        db.query('SELECT * FROM quote_requests LIMIT 10')
      );
    }

    const startTime = Date.now();
    await Promise.all(queryPromises);
    const endTime = Date.now();

    const avgTime = (endTime - startTime) / queryCount;
    console.log(`평균 쿼리 응답 시간: ${avgTime}ms`);

    if (avgTime < 100) {
      console.log('✅ 데이터베이스 쿼리 성능 기준 충족 (100ms 이하)');
    } else {
      console.log('❌ 데이터베이스 쿼리 성능 기준 미달');
    }

  } catch (error) {
    console.error('데이터베이스 부하 테스트 실패:', error);
  } finally {
    await db.end();
  }
}

// 메모리 사용량 모니터링
function monitorMemoryUsage() {
  const used = process.memoryUsage();
  const total = Math.round(used.heapTotal / 1024 / 1024);
  const usedMB = Math.round(used.heapUsed / 1024 / 1024);
  const external = Math.round(used.external / 1024 / 1024);

  console.log('메모리 사용량:');
  console.log(`Heap Total: ${total} MB`);
  console.log(`Heap Used: ${usedMB} MB`);
  console.log(`External: ${external} MB`);

  if (usedMB < 100) {
    console.log('✅ 메모리 사용량 기준 충족 (100MB 이하)');
  } else {
    console.log('❌ 메모리 사용량 기준 미달');
  }
}

// 성능 테스트 실행
async function runPerformanceTests() {
  console.log('=== 성능 테스트 시작 ===\n');

  try {
    // 1. API 부하 테스트
    console.log('1. API 부하 테스트');
    await runLoadTest();
    console.log('');

    // 2. 데이터베이스 부하 테스트
    console.log('2. 데이터베이스 부하 테스트');
    await runDatabaseLoadTest();
    console.log('');

    // 3. 메모리 사용량 모니터링
    console.log('3. 메모리 사용량 모니터링');
    monitorMemoryUsage();
    console.log('');

    console.log('=== 성능 테스트 완료 ===');

  } catch (error) {
    console.error('성능 테스트 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  runPerformanceTests();
}

module.exports = { runLoadTest, runDatabaseLoadTest, monitorMemoryUsage };
