const path = require('path');
const fs = require('fs');
const {execSync} = require('child_process');
const copyDir = require('copy-dir');
const makeDir = require('make-dir');
const octophant = require('octophant');
const ora = require('ora');
const config = require('../lib/config');
const packageJson = require('../package.json');

// Make sure the name is valid and folder does not exist
const preflight = dir => {
  const baseName = path.basename(dir);

  if (baseName === '.') {
    throw new Error('The name of your project can\'t start with a dot.');
  }

  try {
    fs.accessSync(dir);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw new Error(`There's already a folder named ${baseName} here.`);
    }
  }
};

// Create initial template
const copyTemplate = dir => {
  makeDir.sync(dir);
  const templateDir = path.resolve(__dirname, '../template');
  copyDir.sync(templateDir, dir);
};

// Build package.json
const writePackageJson = dir => {
  const outputPath = path.join(dir, 'package.json');
  const pkg = {
    name: path.basename(dir),
    scripts: {
      start: 'foundation-scripts start',
      build: 'foundation-scripts build',
      eject: 'foundation-scripts eject'
    },
    dependencies: {
      'foundation-sites': `^${config.foundationVersion}.0`,
      'motion-ui': `^1.2.0`
    },
    devDependencies: {
      'foundation-scripts': packageJson.version
    },
    engines: {
      node: '>=6'
    }
  };

  fs.writeFileSync(outputPath, JSON.stringify(pkg, null, '  '));
};

// Install dependencies with yarn
const installDependencies = dir => {
  const test = process.env.NODE_ENV === 'test';

  try {
    if (test) {
      execSync('npm link');
    }

    process.chdir(dir);

    if (test) {
      execSync('npm link foundation-scripts');
    }

    execSync('npm install');
  } catch (err) {
    console.log('Error running an npm command:');
    console.log(err.stdout.toString());
    console.log(err.stderr.toString());
  }
};

// Create settings file
const createSettingsFile = (dir, cb) => {
  const options = {
    title: 'Foundation for Sites Settings',
    output: './src/assets/styles/_settings.scss',
    groups: {
      grid: 'The Grid',
      'off-canvas': 'Off-canvas',
      'typography-base': 'Base Typography'
    },
    sort: [
      'global',
      'breakpoints',
      'grid',
      'typography-base',
      'typography-helpers'
    ],
    imports: ['util/util'],
    _foundationShim: true
  };

  octophant('./node_modules/foundation-sites/scss', options, cb);
};

/**
 * Create a blank Foundation project from a template, and automatically install dependencies.
 * @param {String} name - Name of project folder.
 * @param {String} [dir] - Directory to create folder in. Defaults to current working directory.
 */
module.exports = (name, dir = process.cwd()) => {
  const outputFolder = path.join(dir, name);
  const spinner = ora('Performing sanity checks...');

  spinner.start();
  try {
    preflight(outputFolder);
  } catch (err) {
    spinner.fail(err.message);
  }

  spinner.text = 'Setting up template files...';
  copyTemplate(outputFolder);
  writePackageJson(outputFolder);

  spinner.text = 'Installing Foundation...';
  installDependencies(outputFolder);
  createSettingsFile(outputFolder, () => {
    spinner.succeed('All done!');
  });
};
