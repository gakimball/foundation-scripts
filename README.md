# foundation-scripts

> Scripts for use by the ZURB Template

This is a proof-of-concept for a `create-react-app`-inspired Foundation boilerplate, which abstracts the build system behind a library, leaving a minimal set of files for the user.

## Explanation

The user starts the process with `foundation new <folder>`. A script in this library then:

- Creates a new boilerplate from a set of local template files.
- Installs dependencies with `npm` (potentially `yarn`).
- Generates a settings file from the version of Foundation that was installed.

Here are the differences from the current CLI process:

- Git is not used, so that dependency is gone from our CLI.
- npm is used instead of Bower. npm's flat installation is now more stable, and can be used in place of Bower.
- The settings file is generated on the fly, so we don't have to manually update it when a new version of Foundation is released.

The template that's created is more minimal than the current ZURB Template. The Babel configuration, Gulpfile, and development dependencies are all stored in this library. **This means that changes to the ZURB Template can be deployed, making updating a project way easier.** Two basic commands control the template: `npm start` to run the dev build process, and `npm run build` to do a one-time build of production assets. Those commands are also managed by this library, allowing us to update them as needed.

The current Gulpfile in here is mostly identical to the current ZURB template, with these differences:

- eslint and Stylelint configs are added, and code is linted whenever files are saved.
- Eyeglass is used to import Foundation and Motion UI from npm, instead of setting import paths manually

For Foundation 7, which will be more Webpack-friendly, we'll use Webpack to compile JavaScript instead of manually defining a list of files to import. With that change, most of the `config.yml` file will be unnecessary, and we could potentially drop it entirely.

This library will also include an `eject` command, again inspired by create-react-app. This template is purposefully abstracted; you can't see or modify the guts of the build system, which simplifies using the template for the majority of users who don't care. What the `eject` command does is convert the template into one that's more malleable. It spits out a Gulpfile, and `.babelrc`, and the other various files that this library abstracts away. It's a one-time operation you can do on a project to convert it from the simplified version to a customizable version. **This hasn't been implemented yet in this repo.**

## Try it Out

```bash
git clone https://github.com/gakimball/foundation-scripts
cd foundation-scripts
npm install
npm test
```

## License

MIT &copy; [Geoff Kimball](http://geoffkimball.com)
