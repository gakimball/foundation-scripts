const browserslist = require('./browserslist');

module.exports = {
  presets: ['env', {
    targets: {
      browsers: browserslist
    }
  }]
};
