const express = require('express');
const createSchoolController = require('../controllers/school.controller');
const createSchoolService = require('../services/schoolService');
const createSchoolRepository = require('../repositories/schoolRepository');
const { writeApiLimiter } = require('../middleware/rateLimit');
const {
  validateAddSchoolRequest,
  validateListSchoolsRequest
} = require('../middleware/validator');
const {
  sqlInjectionQueryProtection,
  sqlInjectionBodyProtection
} = require('../middleware/sqlInjectionProtection');


const schoolRepository = createSchoolRepository();
const schoolService = createSchoolService(schoolRepository);
const schoolController = createSchoolController(schoolService);

const router = express.Router();

router.post(
  '/addSchool',
  writeApiLimiter,
  sqlInjectionBodyProtection,
  validateAddSchoolRequest,
  schoolController.addSchool
);

router.get(
  '/listSchools',
  sqlInjectionQueryProtection,
  validateListSchoolsRequest,
  schoolController.listSchools
);

module.exports = router;
