/* eslint-env mocha */

const scripts = require('.');

describe('create()', function () {
  const tmp = 'tmp';
  this.timeout(0);

  it('works?', () => {
    scripts.create(tmp, process.cwd());
  });
});
