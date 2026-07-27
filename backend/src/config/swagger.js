const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '견적서비스 API',
      version: '1.0.0',
      description: '견적요청/견적서 서비스 REST API 문서',
      contact: {
        name: 'API Support',
        email: 'support@quoteservice.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '개발 서버'
      },
      {
        url: 'https://api.quoteservice.com',
        description: '프로덕션 서버'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '사용자 ID'
            },
            email: {
              type: 'string',
              description: '이메일'
            },
            name: {
              type: 'string',
              description: '이름'
            },
            phone: {
              type: 'string',
              description: '전화번호'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: '역할'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: '생성일'
            }
          }
        },
        QuoteRequest: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '견적 요청 ID'
            },
            user_id: {
              type: 'integer',
              description: '사용자 ID'
            },
            category_id: {
              type: 'integer',
              description: '카테고리 ID'
            },
            title: {
              type: 'string',
              description: '제목'
            },
            description: {
              type: 'string',
              description: '상세 설명'
            },
            location: {
              type: 'string',
              description: '장소'
            },
            budget: {
              type: 'number',
              description: '예산'
            },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed', 'cancelled'],
              description: '상태'
            },
            preferred_date: {
              type: 'string',
              format: 'date',
              description: '희망 날짜'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: '생성일'
            }
          }
        },
        Quote: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '견적서 ID'
            },
            quote_request_id: {
              type: 'integer',
              description: '견적 요청 ID'
            },
            admin_id: {
              type: 'integer',
              description: '관리자 ID'
            },
            title: {
              type: 'string',
              description: '제목'
            },
            description: {
              type: 'string',
              description: '상세 설명'
            },
            price: {
              type: 'number',
              description: '견적 가격'
            },
            valid_until: {
              type: 'string',
              format: 'date',
              description: '유효 기간'
            },
            status: {
              type: 'string',
              enum: ['draft', 'sent', 'approved', 'rejected'],
              description: '상태'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: '생성일'
            }
          }
        },
        Contract: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '계약서 ID'
            },
            quote_id: {
              type: 'integer',
              description: '견적서 ID'
            },
            user_id: {
              type: 'integer',
              description: '사용자 ID'
            },
            contract_number: {
              type: 'string',
              description: '계약번호'
            },
            total_amount: {
              type: 'number',
              description: '계약 총액'
            },
            start_date: {
              type: 'string',
              format: 'date',
              description: '계약 시작일'
            },
            end_date: {
              type: 'string',
              format: 'date',
              description: '계약 종료일'
            },
            terms: {
              type: 'string',
              description: '계약 조건'
            },
            status: {
              type: 'string',
              enum: ['pending', 'signed', 'completed', 'cancelled'],
              description: '상태'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: '생성일'
            }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '결제 ID'
            },
            contract_id: {
              type: 'integer',
              description: '계약서 ID'
            },
            user_id: {
              type: 'integer',
              description: '사용자 ID'
            },
            amount: {
              type: 'number',
              description: '결제 금액'
            },
            payment_method: {
              type: 'string',
              description: '결제 수단'
            },
            payment_status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'refunded'],
              description: '결제 상태'
            },
            transaction_id: {
              type: 'string',
              description: '거래 ID'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: '생성일'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: '에러 메시지'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
