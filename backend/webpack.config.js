const path = require('path');

module.exports = function (options, webpack) {
  return {
    ...options,
    entry: path.resolve(__dirname, 'api/src/main.ts'),
    output: {
      path: path.resolve(__dirname, 'api/dist'),
      filename: 'main.js',
    },
  };
};
