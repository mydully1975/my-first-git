const QuoteRequest = require('../models/QuoteRequest');
const Quote = require('../models/Quote');
const User = require('../models/User');
const Category = require('../models/Category');

const getDashboardStats = async (req, res) => {
  try {
    // 기간별 필터링 (기본: 최근 30일)
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 견적요청 통계
    const totalQuoteRequests = await QuoteRequest.getCount({});
    const pendingQuoteRequests = await QuoteRequest.getCount({ status: 'pending' });
    const quotingQuoteRequests = await QuoteRequest.getCount({ status: 'quoting' });
    const completedQuoteRequests = await QuoteRequest.getCount({ status: 'completed' });

    // 견적서 통계
    const totalQuotes = await Quote.getCount({});
    const draftQuotes = await Quote.getCount({ status: 'draft' });
    const sentQuotes = await Quote.getCount({ status: 'sent' });
    const approvedQuotes = await Quote.getCount({ status: 'approved' });
    const rejectedQuotes = await Quote.getCount({ status: 'rejected' });

    // 승인율 계산
    const approvalRate = sentQuotes > 0 ? (approvedQuotes / sentQuotes) * 100 : 0;

    // 사용자 통계
    const totalUsers = await User.findAll({ limit: 1 });
    const totalUserCount = totalUsers.length > 0 ? (await User.findAll({ limit: 1000 })).length : 0;
    const customerCount = (await User.findAll({ role: 'customer', limit: 1000 })).length;

    // 카테고리별 견적요청 수
    const categories = await Category.findAll({});
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const count = await QuoteRequest.getCount({ category_id: category.id });
        return {
          category_id: category.id,
          category_name: category.name,
          request_count: count,
        };
      })
    );

    // 최근 견적요청 (최근 10개)
    const recentRequests = await QuoteRequest.findAll({ limit: 10, offset: 0 });

    // 최근 견적서 (최근 10개)
    const recentQuotes = await Quote.findAll({ limit: 10, offset: 0 });

    res.json({
      stats: {
        quote_requests: {
          total: totalQuoteRequests,
          pending: pendingQuoteRequests,
          quoting: quotingQuoteRequests,
          completed: completedQuoteRequests,
        },
        quotes: {
          total: totalQuotes,
          draft: draftQuotes,
          sent: sentQuotes,
          approved: approvedQuotes,
          rejected: rejectedQuotes,
          approval_rate: Math.round(approvalRate * 100) / 100,
        },
        users: {
          total: totalUserCount,
          customers: customerCount,
        },
      },
      category_stats: categoryStats.sort((a, b) => b.request_count - a.request_count),
      recent_requests: recentRequests,
      recent_quotes: recentQuotes,
      period: {
        days,
        start_date: startDate.toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: '대시보드 통계 조회에 실패했습니다.' });
  }
};

const getQuoteRequestStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // 일별 견적요청 통계
    const dailyStats = await QuoteRequest.getDailyStats(days);

    res.json({
      daily_stats: dailyStats,
      period: {
        days,
      },
    });
  } catch (error) {
    console.error('Get quote request stats error:', error);
    res.status(500).json({ error: '견적요청 통계 조회에 실패했습니다.' });
  }
};

const getAdminPerformance = async (req, res) => {
  try {
    const { admin_id } = req.params;
    const { days = 30 } = req.query;

    // 관리자별 견적서 처리 통계
    const adminQuotes = await Quote.findByAdminId(admin_id, { limit: 1000, offset: 0 });

    const stats = {
      total_quotes: adminQuotes.length,
      sent_quotes: adminQuotes.filter((q) => q.status === 'sent').length,
      approved_quotes: adminQuotes.filter((q) => q.status === 'approved').length,
      rejected_quotes: adminQuotes.filter((q) => q.status === 'rejected').length,
    };

    const approvalRate = stats.sent_quotes > 0 ? (stats.approved_quotes / stats.sent_quotes) * 100 : 0;

    res.json({
      admin_id,
      stats: {
        ...stats,
        approval_rate: Math.round(approvalRate * 100) / 100,
      },
      period: {
        days,
      },
    });
  } catch (error) {
    console.error('Get admin performance error:', error);
    res.status(500).json({ error: '관리자 성과 조회에 실패했습니다.' });
  }
};

module.exports = {
  getDashboardStats,
  getQuoteRequestStats,
  getAdminPerformance,
};