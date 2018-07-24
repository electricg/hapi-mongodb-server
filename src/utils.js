module.exports.formatError = (msg, err) => {
  let details = '';

  if (err) {
    const { message, statusCode, statusMessage } = err;

    if (message) {
      details = message;
    }

    if (statusCode || statusMessage) {
      details = `${statusCode} ${statusMessage}`;
    }
  }

  return {
    status: 0,
    error: msg,
    details,
  };
};

module.exports.formatOrigins = input => {
  const output = typeof input === 'string' ? input.split(',') : input;

  if (Array.isArray(output)) {
    return output.reduce((accumulator, item) => {
      if (typeof item === 'string' && item !== '') {
        accumulator.push(item.trim());
      }

      return accumulator;
    }, []);
  }

  return [];
};

module.exports.log = function() {
  const args = Array.prototype.slice.call(arguments, 0);
  console.log.apply(console, args);
};
