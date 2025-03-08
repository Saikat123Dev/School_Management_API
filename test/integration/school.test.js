const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');
const { pool, initializeDatabase } = require('../../config/db.config');

describe('School API Integration Tests', function() {
  // Increase the timeout for the entire test suite
  this.timeout(10000);

  before(async function() {
    try {
      await initializeDatabase();
    } catch (err) {
      console.error('Database initialization failed:', err);
      throw err;
    }
  });

  beforeEach(async function() {
    try {
      await pool.query('DELETE FROM schools');
    } catch (err) {
      console.error('Failed to clean up schools table:', err);
      throw err;
    }
  });

  describe('POST /api/addSchool', () => {
    it('should add a new school with valid data', async () => {
      const schoolData = {
        name: 'Integration Test School',
        address: '123 Test Avenue',
        latitude: 40.7128,
        longitude: -74.0060
      };

      const res = await request(app)
        .post('/api/addSchool')
        .send(schoolData);

      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property('id');
      expect(res.body.data.name).to.equal(schoolData.name);
    });

    it('should return validation errors with invalid data', async () => {
      const invalidData = {
        name: '',
        address: '123 Test Avenue',
        latitude: 40.7128,
        longitude: -74.0060
      };

      const res = await request(app)
        .post('/api/addSchool')
        .send(invalidData);

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.errors).to.be.an('array').that.is.not.empty;
    });
  });

  describe('GET /api/listSchools', () => {
    beforeEach(async function() {
      try {
        // Add test schools
        await pool.query(`
          INSERT INTO schools (name, address, latitude, longitude)
          VALUES
          ('School A', 'Address A', 40.7128, -74.0060),
          ('School B', 'Address B', 34.0522, -118.2437)
        `);
      } catch (err) {
        console.error('Failed to insert test schools:', err);
        throw err;
      }
    });



    it('should return validation errors with invalid coordinates', async () => {
      const res = await request(app)
        .get('/api/listSchools')
        .query({ latitude: 'invalid', longitude: -74.0 });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.errors).to.be.an('array').that.is.not.empty;
    });
  });

  after(async function() {
    try {
      await pool.query('DELETE FROM schools');
      await pool.end();
    } catch (err) {
      console.error('Failed to clean up and close pool:', err);
      throw err;
    }
  });
});
