const notFound = (req, res, next) => {
  res.status(404).json({
    error: '요청한 리소스를 찾을 수 없습니다.',
    path: req.originalUrl,
  });
};

module.exports = notFound;