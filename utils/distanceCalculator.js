function calculateDistance(lat1, lon1, lat2, lon2) {

  const R = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance;
}

function calculateShortestDistance(lat1, lon1, lat2, lon2) {

  let lon1Normalized = lon1;
  let lon2Normalized = lon2;

  if (Math.abs(lon1 - lon2) > 180) {

    if (lon1 < 0) {
      lon1Normalized = lon1 + 360;
    } else {
      lon2Normalized = lon2 + 360;
    }
  }

  return calculateDistance(lat1, lon1Normalized, lat2, lon2Normalized);
}

function toRadians(degrees) {
  return degrees * (Math.PI/180);
}

module.exports = {
  calculateDistance,
  calculateShortestDistance,
  toRadians
};
