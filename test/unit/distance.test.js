const { expect } = require('chai');
const DistanceCalculator = require('../../utils/distanceCalculator');

describe('Distance Calculator', () => {
  it('should calculate distance between two points correctly', () => {

    const distance = DistanceCalculator.calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
    expect(distance).to.be.within(3930, 3950);
  });

  it('should return 0 for the same coordinates', () => {
    const distance = DistanceCalculator.calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
    expect(distance).to.equal(0);
  });
});
