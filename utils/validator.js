
const { containsSqlInjection } = require('../middleware/sqlInjectionProtection');

function validateSchool(school) {
  const errors = [];


  if (!school.name || school.name.trim() === '') {
    errors.push('Name is required and must be a non-empty string');
  } else if (school.name.length > 255) {
    errors.push('Name must be less than 255 characters');
  } else if (containsInvalidCharacters(school.name) || containsSqlInjection(school.name)) {
    errors.push('School name contains invalid characters or potentially harmful content');
  }

  if (!school.address || school.address.trim() === '') {
    errors.push('Address is required and must be a non-empty string');
  } else if (school.address.length > 255) {
    errors.push('Address must be less than 255 characters');
  } else if (containsSqlInjection(school.address)) {
    errors.push('Address contains potentially harmful content');
  }

  if (school.latitude === undefined || school.latitude === null || isNaN(parseFloat(school.latitude))) {
    errors.push('Latitude is required and must be a valid number');
  } else {
    const lat = parseFloat(school.latitude);

    if (Math.abs(lat) === 90) {
      errors.push('Exact pole coordinates (±90°) are generally not valid school locations');
    } else if (!isValidLatitude(lat)) {
      errors.push('Latitude must be between -90 and 90');
    }
  }

  if (school.longitude === undefined || school.longitude === null || isNaN(parseFloat(school.longitude))) {
    errors.push('Longitude is required and must be a valid number');
  } else {
    const lng = parseFloat(school.longitude);
    if (Math.abs(lng) === 180) {
      errors.push('Exact international date line coordinates (±180°) are generally not valid school locations');
    } else if (!isValidLongitude(lng)) {
      errors.push('Longitude must be between -180 and 180');
    }
  }

  return errors;
}

function validateCoordinates(latitude, longitude) {
  const errors = [];

  // Check for SQL injection in string parameters
  if (typeof latitude === 'string' && containsSqlInjection(latitude)) {
    errors.push('Latitude contains potentially harmful content');
    return errors;
  }

  if (typeof longitude === 'string' && containsSqlInjection(longitude)) {
    errors.push('Longitude contains potentially harmful content');
    return errors;
  }

  if (latitude === undefined || latitude === null || isNaN(parseFloat(latitude))) {
    errors.push('Latitude is required and must be a valid number');
    return errors; // Early return to avoid additional validation on invalid input
  }

  if (longitude === undefined || longitude === null || isNaN(parseFloat(longitude))) {
    errors.push('Longitude is required and must be a valid number');
    return errors; // Early return to avoid additional validation on invalid input
  }

  // Only validate ranges if we have numbers
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  // Check for extreme values
  if (Math.abs(lat) === 90) {
    errors.push('Exact pole coordinates (±90°) are generally not useful for school searches');
  } else if (!isValidLatitude(lat)) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (Math.abs(lng) === 180) {
    errors.push('Exact international date line coordinates (±180°) are generally not useful for school searches');
  } else if (!isValidLongitude(lng)) {
    errors.push('Longitude must be between -180 and 180');
  }

  return errors;
}

function isValidLatitude(lat) {
  return !isNaN(lat) && lat > -90 && lat < 90;
}

function isValidLongitude(lng) {
  return !isNaN(lng) && lng > -180 && lng < 180;
}

function containsInvalidCharacters(str) {
  const suspiciousPatterns = [
    /<script/i,
    /<iframe/i,
    /<img/i,
    /javascript:/i,
    /\bOR\b.*?[=;]/i,
    /\bUNION\b.*?\bSELECT\b/i,
    /\bDROP\b.*?\bTABLE\b/i,
    /\bALTER\b.*?\bTABLE\b/i,
    /\bDELETE\b.*?\bFROM\b/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(str));
}

module.exports = {
  validateSchool,
  validateCoordinates,
  isValidLatitude,
  isValidLongitude,
  containsInvalidCharacters
};
