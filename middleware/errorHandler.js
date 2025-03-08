const { ValidationError, DatabaseError, NotFoundError } = require('../utils/errors');
const { failure } = require('../utils/responseFormatter');

function errorHandler(err, req, res, next) {

  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  if (err instanceof ValidationError) {
    return res.status(400).json(failure('Validation failed', err.errors));
  }

  if (err instanceof DatabaseError) {
    return res.status(500).json(failure('Database error', [err.message]));
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json(failure(err.message));
  }

  return res.status(500).json(failure('Internal server error'));
}

module.exports = errorHandler;
