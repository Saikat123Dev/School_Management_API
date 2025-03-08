const { pool } = require('../config/db.config');
const { DatabaseError } = require('../utils/errors');
const { containsInvalidCharacters } = require('../utils/validator');
const { containsSqlInjection } = require('../middleware/sqlInjectionProtection');

function createSchoolRepository() {
  return {
    async create(schoolData) {
      try {

        if (containsInvalidCharacters(schoolData.name) ||
            containsInvalidCharacters(schoolData.address) ||
            containsSqlInjection(schoolData.name) ||
            containsSqlInjection(schoolData.address)) {
          throw new DatabaseError('Potentially harmful content detected in input');
        }


        const [result] = await pool.query(
          'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
          [
            sanitizeInput(schoolData.name),
            sanitizeInput(schoolData.address),
            schoolData.latitude,
            schoolData.longitude
          ]
        );

        return {
          id: result.insertId,
          name: schoolData.name,
          address: schoolData.address,
          latitude: schoolData.latitude,
          longitude: schoolData.longitude
        };
      } catch (error) {
        throw new DatabaseError(`Error creating school: ${error.message}`);
      }
    },

    async findAll() {
      try {

        const [rows] = await pool.query('SELECT * FROM schools');
        return rows;
      } catch (error) {
        throw new DatabaseError(`Error retrieving schools: ${error.message}`);
      }
    },

    async findAllPaginated(page = 1, limit = 10) {
      try {

        const sanitizedPage = Math.max(1, parseInt(page, 10) || 1);
        const sanitizedLimit = Math.min(Math.max(1, parseInt(limit, 10) || 10), 100);

        const offset = (sanitizedPage - 1) * sanitizedLimit;

        const [rows] = await pool.query(
          'SELECT * FROM schools LIMIT ? OFFSET ?',
          [sanitizedLimit, offset]
        );


        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM schools');
        const total = countResult[0].total;

        return {
          schools: rows,
          pagination: {
            page: sanitizedPage,
            limit: sanitizedLimit,
            total,
            totalPages: Math.ceil(total / sanitizedLimit)
          }
        };
      } catch (error) {
        throw new DatabaseError(`Error retrieving schools: ${error.message}`);
      }
    }
  };
}

function sanitizeInput(str) {
  if (!str) return '';

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\\/g, '&#92;')
    .replace(/`/g, '&#96;')
    .trim();
}

module.exports = createSchoolRepository;
