const logGulp = require('../lib/log-gulp');

/**
 * Set Node environment to `production` and run the `build` Gulp task, which runs the build
 * process once.
 */
module.exports = () => {
  process.env.NODE_ENV = 'production';
  const gulp = require('../lib/gulpfile');
  logGulp(gulp);

  gulp.parallel('build')(err => {
    if (err) {
      throw new Error(err);
    }
  });
};
