
function escapeIdentifier(identifier) {
  if (!identifier) return '';

  return identifier.replace(/[^a-zA-Z0-9_]/g, '');
}

function sanitizePaginationParams(page, limit) {

  const sanitizedPage = Math.max(1, parseInt(page, 10) || 1);

  const sanitizedLimit = Math.min(Math.max(1, parseInt(limit, 10) || 10), 100);

  return {
    page: sanitizedPage,
    limit: sanitizedLimit,
    offset: (sanitizedPage - 1) * sanitizedLimit
  };
}

function sanitizeNumericParam(value, defaultValue, min, max) {
  const parsed = parseFloat(value);

  if (isNaN(parsed)) {
    return defaultValue;
  }

  if (min !== undefined && parsed < min) {
    return min;
  }

  if (max !== undefined && parsed > max) {
    return max;
  }

  return parsed;
}

module.exports = {
  escapeIdentifier,
  sanitizePaginationParams,
  sanitizeNumericParam
};
