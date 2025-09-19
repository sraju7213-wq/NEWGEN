function errorHandler(err, req, res, _next) {
  console.error('Error handler:', err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    detail: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = errorHandler;
