const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('babel-preserve-modules', {
  env: {
    test: {
      plugins: [
        'rewire',
      ],
    },
  },
});
