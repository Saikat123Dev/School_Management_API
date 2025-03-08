const { validateSchool, validateCoordinates } = require('../middleware/validator');
const { ValidationError } = require('../utils/errors');
const { calculateDistance, calculateShortestDistance } = require('../utils/distanceCalculator');
const { DatabaseError } = require('../utils/errors');

const MAX_DB_RETRIES = 3;

function createSchoolService(schoolRepository) {
  return {
    async addSchool(schoolData) {

      let retries = 0;
      while (retries < MAX_DB_RETRIES) {
        try {
          return await schoolRepository.create(schoolData);
        } catch (error) {
          if (error instanceof DatabaseError && retries < MAX_DB_RETRIES - 1 && isTransientError(error)) {
            retries++;
            await sleep(200 * retries);
            continue;
          }
          throw error;
        }
      }
    },

    async listSchoolsByDistance(latitude, longitude, page = 1, limit = 10) {

      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);

      let retries = 0;
      let result;

      while (retries < MAX_DB_RETRIES) {
        try {

          result = await schoolRepository.findAllPaginated(page, limit);
          break;
        } catch (error) {
          if (error instanceof DatabaseError && retries < MAX_DB_RETRIES - 1 && isTransientError(error)) {
            retries++;
            await sleep(200 * retries);
            continue;
          }
          throw error;
        }
      }


      const schools = result.schools.map(school => {
        const distance = calculateShortestDistance(
          userLat, userLng,
          school.latitude, school.longitude
        );
        return { ...school, distance };
      });

      schools.sort((a, b) => a.distance - b.distance);

      return {
        schools,
        pagination: result.pagination
      };
    }
  };
}

function isTransientError(error) {
  const transientErrorCodes = ['ECONNRESET', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST'];
  return transientErrorCodes.some(code => error.message.includes(code));
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = createSchoolService;
