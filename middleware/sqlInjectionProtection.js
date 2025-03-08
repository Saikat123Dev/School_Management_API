

const { ValidationError } = require('../utils/errors');

const SQL_INJECTION_PATTERNS = [

  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,

  /(\%3B)|(;)/i,

  /(union).*?(select|all)/i,

  /(select|update|insert|delete|drop|alter|create|truncate)/i,

  /(exec\s*\(|char\s*\(|cast\s*\(|convert\s*\(|concat\s*\()/i,

  /(waitfor\s*delay|sleep\s*\(|benchmark\s*\()/i,

  /(load_file|outfile|dumpfile)/i,

  /(\%u0027)|(\%u02b9)|(\%u02bc)|(\%u02c8)/i,

  /(\%3B\s*select|\%3B\s*insert|\%3B\s*update|\%3B\s*delete|\%3B\s*drop)/i,

  /(\-\-\s*$)|(\/\*[\w\W]*?\*\/)/i
];


function containsSqlInjection(str) {
  if (!str || typeof str !== 'string') return false;

  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(str));
}

function sqlInjectionQueryProtection(req, res, next) {
  try {

    const queryParams = req.query;
    for (const key in queryParams) {
      if (containsSqlInjection(queryParams[key])) {
        throw new ValidationError([`Potential SQL injection detected in parameter: ${key}`]);
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}

function sqlInjectionBodyProtection(req, res, next) {
  try {

    checkObjectForSqlInjection(req.body);
    next();
  } catch (error) {
    next(error);
  }
}

function checkObjectForSqlInjection(obj, path = '') {
  if (!obj || typeof obj !== 'object') return;

  for (const key in obj) {
    const currentPath = path ? `${path}.${key}` : key;
    const value = obj[key];

    if (typeof value === 'string' && containsSqlInjection(value)) {
      throw new ValidationError([`Potential SQL injection detected in field: ${currentPath}`]);
    } else if (typeof value === 'object' && value !== null) {
      checkObjectForSqlInjection(value, currentPath);
    }
  }
}

module.exports = {
  sqlInjectionQueryProtection,
  sqlInjectionBodyProtection,
  containsSqlInjection
};
