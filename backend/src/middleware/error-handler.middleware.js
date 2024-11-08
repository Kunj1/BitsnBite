const logger = require('../config/logger.config');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
};

module.exports = errorHandler;
