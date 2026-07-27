const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: '유효성 검사 오류',
      details: err.errors,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: '유효하지 않은 토큰입니다.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: '토큰이 만료되었습니다.',
    });
  }

  res.status(500).json({
    error: '서버 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

module.exports = errorHandler;