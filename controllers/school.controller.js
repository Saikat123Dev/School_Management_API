const { success } = require('../utils/responseFormatter');
const { sanitizeNumericParam, sanitizePaginationParams } = require('../utils/dbSecurity');

function createSchoolController(schoolService) {
  return {
    async addSchool(req, res, next) {
      try {
        const schoolData = {
          name: req.body.name,
          address: req.body.address,
          latitude: sanitizeNumericParam(req.body.latitude, 0, -89.999999, 89.999999),
          longitude: sanitizeNumericParam(req.body.longitude, 0, -179.999999, 179.999999)
        };

        const savedSchool = await schoolService.addSchool(schoolData);

        return res.status(201).json(
          success(savedSchool, 'School added successfully')
        );
      } catch (error) {
        next(error);
      }
    },

    async listSchools(req, res, next) {
      try {
        const { latitude, longitude, page, limit } = req.query;

        const sanitizedLat = sanitizeNumericParam(latitude, 0, -89.999999, 89.999999);
        const sanitizedLng = sanitizeNumericParam(longitude, 0, -179.999999, 179.999999);

        const pagination = sanitizePaginationParams(page, limit);

        const result = await schoolService.listSchoolsByDistance(
          sanitizedLat,
          sanitizedLng,
          pagination.page,
          pagination.limit
        );

        return res.status(200).json(success(result));
      } catch (error) {
        next(error);
      }
    }
  };
}

module.exports = createSchoolController;
