const browserslist = require('./browserslist');

/**
 * Babel configuration used by the build process. When a template is ejected, this object is
 * written to a `.babelrc`.
 */
module.exports = {
  presets: ['env', {
    targets: {
      browsers: browserslist
    }
  }]
};
