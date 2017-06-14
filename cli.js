#!/usr/bin/env node

const meow = require('meow');
const scripts = require('.');

const cli = meow(`
  Usage:
    $ foundation-scripts <command>

  Examples:
    $ foundation-scripts start
    $ foundation-scripts build
    $ foundation-scripts eject
`);

const [command, ...args] = cli.input;

if (command in scripts) {
  scripts[command](...args);
} else {
  cli.showHelp(0);
}
