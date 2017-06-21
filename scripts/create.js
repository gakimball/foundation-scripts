const path = require('path');
const fs = require('fs');
const pify = require('pify');
const copyDir = pify(require('copy-dir'));
const octophant = require('octophant');
const ora = require('ora');
const execa = require('execa');
const config = require('../lib/config');
const packageJson = require('../package.json');

const writeFile = pify(fs.writeFile);

// Make sure the name is valid and folder does not exist
const preflight = dir => new Promise((resolve, reject) => {
  const baseName = path.basename(dir);

  if (baseName[0] === '.') {
    reject(new Error('The name of your project can\'t start with a dot.'));
  }

  fs.access(dir, err => {
    if (err && err.code === 'ENOENT') {
      resolve();
    } else {
      reject(new Error(`There's already a folder named ${baseName} here.`));
    }
  });
});

// Create initial template
const copyTemplate = dir => {
  const templateDir = path.resolve(__dirname, '../template');
  return copyDir(templateDir, dir);
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

  return writeFile(outputPath, JSON.stringify(pkg, null, '  '));
};

// Install dependencies with yarn
const installDependencies = dir => {
  const test = process.env.NODE_ENV === 'test';
  const install = () => execa.shell('npm install --silent');

  if (test) {
    return execa.shell('npm link')
      .then(() => {
        process.chdir(dir);
        return execa.shell('npm link foundation-scripts');
      })
      .then(install);
  }

  return install();
};

// Create settings file
const createSettingsFile = dir => {
  const options = {
    title: 'Foundation for Sites Settings',
    output: path.resolve(dir, 'src/assets/styles/_settings.scss'),
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

  return octophant(path.resolve(dir, 'node_modules/foundation-sites/scss/**/*.scss'), options);
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

  return preflight(outputFolder)
    .then(() => {
      spinner.text = 'Setting up template files...';
      return copyTemplate(outputFolder);
    })
    .then(() => writePackageJson(outputFolder))
    .then(() => {
      spinner.text = 'Installing Foundation...';
      return installDependencies(outputFolder);
    })
    .then(() => createSettingsFile(outputFolder))
    .then(() => {
      spinner.succeed('All done!');
    })
    .catch(err => {
      spinner.fail(err.message);
      console.log(err);
    });
};
