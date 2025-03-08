const { ValidationError } = require('../utils/errors');
const validator = require('../utils/validator');

function validateSchool(school) {
  const errors = validator.validateSchool(school);

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  return true;
}

function validateCoordinates(latitude, longitude) {
  const errors = validator.validateCoordinates(latitude, longitude);

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  return true;
}


function validateAddSchoolRequest(req, res, next) {
  try {
    const schoolData = {
      name: req.body.name,
      address: req.body.address,
      latitude: req.body.latitude,
      longitude: req.body.longitude
    };

    validateSchool(schoolData);
    next();
  } catch (error) {
    next(error);
  }
}

function validateListSchoolsRequest(req, res, next) {
  try {
    const { latitude, longitude } = req.query;
    validateCoordinates(latitude, longitude);
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  validateSchool,
  validateCoordinates,
  validateAddSchoolRequest,
  validateListSchoolsRequest
};
