function success(data, message) {
  return {
    success: true,
    data,
    message
  };
}

function failure(message, errors) {
  return {
    success: false,
    message,
    errors
  };
}

module.exports = {
  success,
  failure
};
