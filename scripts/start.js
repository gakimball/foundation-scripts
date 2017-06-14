const logGulp = require('../lib/log-gulp');

/**
 * Start the Gulp build process and watch files for changes.
 */
module.exports = () => {
  const gulp = require('../lib/gulpfile');
  logGulp(gulp);

  gulp.parallel('default')(err => {
    if (err) {
      throw new Error(err);
    }
  });
};
