/* eslint-env mocha */

const scripts = require('.');

describe('create()', () => {
  it('works?', function () {
    this.timeout(0);
    return scripts.create('tmp', process.cwd());
  });
});
