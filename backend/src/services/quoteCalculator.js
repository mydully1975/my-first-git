const Category = require('../models/Category');
const QuoteRequest = require('../models/QuoteRequest');

class QuoteCalculator {
  /**
   * 견적서 자동 계산
   * @param {number} quoteRequestId - 견적요청 ID
   * @returns {Object} 계산된 견적 정보
   */
  static async calculateQuote(quoteRequestId) {
    try {
      // 견적요청 정보 조회
      const quoteRequest = await QuoteRequest.findById(quoteRequestId);
      if (!quoteRequest) {
        throw new Error('견적요청을 찾을 수 없습니다.');
      }

      // 카테고리 정보 조회
      const category = await Category.findById(quoteRequest.category_id);
      if (!category) {
        throw new Error('카테고리를 찾을 수 없습니다.');
      }

      // 기본 가격 가져오기
      let basePrice = parseFloat(category.base_price) || 0;

      // 요구사항 분석 및 추가 비용 계산
      const requirements = quoteRequest.requirements || {};
      const additionalCosts = this.calculateAdditionalCosts(requirements, category);

      // 희망 예산 범위 확인
      let adjustedPrice = basePrice + additionalCosts.total;

      // 예산 범위 내에서 조정
      if (quoteRequest.budget_min && quoteRequest.budget_max) {
        const budgetMin = parseFloat(quoteRequest.budget_min);
        const budgetMax = parseFloat(quoteRequest.budget_max);

        if (adjustedPrice < budgetMin) {
          adjustedPrice = budgetMin;
        } else if (adjustedPrice > budgetMax) {
          adjustedPrice = budgetMax;
        }
      }

      // 긴급도에 따른 추가 비용 (희망 일정이 빠른 경우)
      let urgencyCost = 0;
      if (quoteRequest.preferred_date) {
        const preferredDate = new Date(quoteRequest.preferred_date);
        const today = new Date();
        const daysUntilPreferred = Math.ceil((preferredDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilPreferred <= 3) {
          urgencyCost = adjustedPrice * 0.2; // 3일 이내: 20% 추가
        } else if (daysUntilPreferred <= 7) {
          urgencyCost = adjustedPrice * 0.1; // 7일 이내: 10% 추가
        }
      }

      const totalAmount = adjustedPrice + urgencyCost;

      // 견적서 상세 내역 구성
      const breakdown = {
        base_price: basePrice,
        additional_items: additionalCosts.items,
        urgency_surcharge: urgencyCost,
        subtotal: adjustedPrice,
        tax: totalAmount * 0.1, // 부가세 10%
        total: totalAmount * 1.1, // 부가세 포함 총액
        description: this.generateDescription(category, requirements, quoteRequest),
      };

      return {
        total_amount: breakdown.total,
        breakdown,
        valid_until: this.calculateValidUntil(),
      };
    } catch (error) {
      console.error('Quote calculation error:', error);
      throw error;
    }
  }

  /**
   * 추가 비용 계산
   * @param {Object} requirements - 요구사항
   * @param {Object} category - 카테고리 정보
   * @returns {Object} 추가 비용 정보
   */
  static calculateAdditionalCosts(requirements, category) {
    const items = [];
    let total = 0;

    // 면적에 따른 추가 비용
    if (requirements.area) {
      const areaCost = requirements.area * 10000; // 1㎡당 10,000원
      items.push({
        name: '면적 추가 비용',
        description: `${requirements.area}㎡`,
        amount: areaCost,
      });
      total += areaCost;
    }

    // 옵션에 따른 추가 비용
    if (requirements.options && Array.isArray(requirements.options)) {
      requirements.options.forEach((option) => {
        const optionCost = this.getOptionCost(option);
        if (optionCost > 0) {
          items.push({
            name: '옵션 추가',
            description: option,
            amount: optionCost,
          });
          total += optionCost;
        }
      });
    }

    // 특수 요청에 따른 추가 비용
    if (requirements.special_requests) {
      const specialCost = 50000; // 특수 요청 기본 비용
      items.push({
        name: '특수 요청',
        description: requirements.special_requests,
        amount: specialCost,
      });
      total += specialCost;
    }

    return { items, total };
  }

  /**
   * 옵션별 비용 가져오기
   * @param {string} option - 옵션 이름
   * @returns {number} 옵션 비용
   */
  static getOptionCost(option) {
    const optionPrices = {
      '급수': 30000,
      '주말 작업': 40000,
      '야간 작업': 50000,
      '자재 구입': 20000,
      '철거 포함': 50000,
      '설치 포함': 30000,
    };

    return optionPrices[option] || 0;
  }

  /**
   * 견적서 설명 생성
   * @param {Object} category - 카테고리
   * @param {Object} requirements - 요구사항
   * @param {Object} quoteRequest - 견적요청
   * @returns {string} 설명
   */
  static generateDescription(category, requirements, quoteRequest) {
    let description = `${category.name} 서비스 견적서\n\n`;
    description += `기본 비용: ${category.base_price}원\n`;

    if (requirements.area) {
      description += `면적: ${requirements.area}㎡\n`;
    }

    if (quoteRequest.preferred_date) {
      description += `희망 일정: ${quoteRequest.preferred_date}\n`;
    }

    if (quoteRequest.budget_min && quoteRequest.budget_max) {
      description += `예산 범위: ${quoteRequest.budget_min}원 ~ ${quoteRequest.budget_max}원\n`;
    }

    description += `\n* 이 견적서는 자동 계산된 기본 견적입니다. 실제 비용은 상담 후 조정될 수 있습니다.`;

    return description;
  }

  /**
   * 견적 유효기간 계산
   * @returns {string} 유효기간 (30일 후)
   */
  static calculateValidUntil() {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);
    return validUntil.toISOString().split('T')[0];
  }
}

module.exports = QuoteCalculator;