const { expect } = require('chai');
const Validator = require('../../utils/validator');

describe('Validator', () => {
  describe('validateSchool', () => {
    it('should return no errors for valid school data', () => {
      const school = {
        name: 'Test School',
        address: '123 Test Street',
        latitude: 40.7128,
        longitude: -74.0060
      };

      const errors = Validator.validateSchool(school);
      expect(errors).to.be.an('array').that.is.empty;
    });

    it('should return errors for invalid name', () => {
      const school = {
        name: '',
        address: '123 Test Street',
        latitude: 40.7128,
        longitude: -74.0060
      };

      const errors = Validator.validateSchool(school);
      expect(errors).to.include('Name is required and must be a non-empty string');
    });

    it('should return errors for invalid coordinates', () => {
      const school = {
        name: 'Test School',
        address: '123 Test Street',
        latitude: 100,
        longitude: -74.0060
      };

      const errors = Validator.validateSchool(school);
      expect(errors).to.include('Latitude must be between -90 and 90');
    });
  });

  describe('validateCoordinates', () => {
    it('should return no errors for valid coordinates', () => {
      const errors = Validator.validateCoordinates(40.7128, -74.0060);
      expect(errors).to.be.an('array').that.is.empty;
    });

    it('should return errors for invalid latitude', () => {
      const errors = Validator.validateCoordinates('not a number', -74.0060);
      expect(errors).to.include('Latitude is required and must be a valid number');
    });
  });
});
