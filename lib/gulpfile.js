const fs = require('fs');
const path = require('path');
const $ = require('gulp-load-plugins')();
const browser = require('browser-sync');
const gulp = require('gulp');
const panini = require('panini');
const rimraf = require('rimraf');
const sherpa = require('style-sherpa');
const yaml = require('js-yaml');
const eyeglass = require('eyeglass');
const load = require('load-whatever').sync;
const webpack = require('webpack');
const sassConfig = require('./webpack.config.sass.js');
$.webpack = require('webpack-stream');

// Check environment
const DEV = process.env.NODE_ENV !== 'production';

// Load settings from settings.yml
const PATHS = load(path.resolve(__dirname, 'config.yml'));

// Build the "dist" folder by running all of the below tasks
gulp.task('build',
  gulp.series(clean, gulp.parallel(pages, sass, javascript, images, copy), styleGuide));

// Build the site, run the server, and watch for file changes
gulp.task('default',
  gulp.series('build', server, watch));

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
  rimraf(PATHS.dist, done);
}

// Copy files out of the assets folder
// This task skips over the "images", "scripts", and "styles" folders, which are parsed separately
function copy() {
  return gulp.src(PATHS.assets)
    .pipe(gulp.dest(`${PATHS.dist}/assets`));
}

// Copy page templates into finished HTML files
function pages() {
  return gulp.src('src/pages/**/*.{html,hbs,handlebars}')
    .pipe(panini({
      root: 'src/pages/',
      layouts: 'src/layouts/',
      partials: 'src/partials/',
      data: 'src/data/',
      helpers: 'src/helpers/'
    }))
    .pipe($.extname('.html'))
    .pipe(gulp.dest(PATHS.dist));
}

// Load updated HTML templates and partials into Panini
function resetPages(done) {
  panini.refresh();
  done();
}

// Generate a style guide from the Markdown content and HTML template in styleguide/
function styleGuide(done) {
  sherpa('src/style-guide/index.md', {
    output: `${PATHS.dist}/styleguide.html`,
    template: 'src/style-guide/template.html'
  }, done);
}

// Compile Sass into CSS
// In production, the CSS is compressed
function sass(cb) {
  return gulp.src('src/assets/styles/app.scss')
    .pipe($.webpack(sassConfig, webpack, cb))
    .on('error', err => console.log(err))
    .pipe($.filter(['*.css', '*.css.map']))
    .pipe(gulp.dest(`${PATHS.dist}/assets/styles`))
    .pipe(browser.stream({ match: '**/*.css' })); // @TODO: BrowserSync doesn't hot reload CSS
}

// Combine JavaScript into one file
// In production, the file is minified
function javascript() {
  return gulp.src(PATHS.javascript)
    .pipe($.sourcemaps.init())
    .pipe($.if(DEV, $.eslint()))
    .pipe($.if(DEV, $.eslint.format()))
    .pipe($.babel({ignore: ['what-input.js']}))
    .pipe($.concat('app.js'))
    .pipe($.if(!DEV, $.uglify()
      .on('error', e => { console.log(e); })
    ))
    .pipe($.if(DEV, $.sourcemaps.write()))
    .pipe(gulp.dest(`${PATHS.dist}/assets/scripts`));
}

// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
  return gulp.src('src/assets/images/**/*')
    .pipe($.if(!DEV, $.imagemin({
      progressive: true
    })))
    .pipe(gulp.dest(`${PATHS.dist}/assets/images`));
}

// Start a server with BrowserSync to preview the site in
function server(done) {
  browser.init({
    server: PATHS.dist
  });
  done();
}

// Reload the browser with BrowserSync
function reload(done) {
  browser.reload();
  done();
}

// Watch for changes to static assets, pages, Sass, and JavaScript
function watch() {
  gulp.watch(PATHS.assets, copy);
  gulp.watch('src/pages/**/*.html').on('all', gulp.series(pages, browser.reload));
  gulp.watch('src/{layouts,partials}/**/*.html').on('all', gulp.series(resetPages, pages, browser.reload));
  gulp.watch('src/assets/scripts/**/*.js').on('all', gulp.series(javascript, browser.reload));
  gulp.watch('src/assets/images/**/*').on('all', gulp.series(images, browser.reload));
  gulp.watch('src/style-guide/**').on('all', gulp.series(styleGuide, browser.reload));
}

module.exports = gulp;
