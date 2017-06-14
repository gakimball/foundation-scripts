const chalk = require('chalk');
const lowerFirst = require('lodash.lowerfirst');

const messages = {
  build: 'Starting build',
  clean: 'Cleaning up files',
  copy: 'Copying static files',
  pages: 'Assembling pages',
  styleGuide: 'Building style guide',
  sass: 'Compiling Sass',
  javascript: 'Compiling JavaScript',
  images: 'Copying images',
  server: 'Starting test server',
  reload: 'Reloading test server'
};

module.exports = gulp => {
  gulp.on('start', ({name}) => {
    if (name in messages) {
      console.log(chalk.cyan(`${messages[name]}...`));
    }
  });

  gulp.on('error', e => {
    const {name} = e;

    if (name in messages) {
      console.log(chalk.red(`Error ${lowerFirst(messages[name])}.`));
    } else {
      console.log(chalk.red(`Error with task ${name}.`));
    }

    console.log(e);
  });
};
