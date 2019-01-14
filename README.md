# TypeScript Library Starter

## Introduction

TypeScript library starter for the Micro:bit Educational Foundation.

This project is designed as a starting point for creating new projects and so doesn't do anything useful itself.

## Development details

Stack:

- [Rollup](https://rollupjs.org/) for bundling
- [Jest](https://jestjs.io/) for testing
- [Prettier](https://prettier.io/) for automated code formatting (integrated with VS Code)
- [TSLint](https://palantir.github.io/tslint/) for linting

Outputs:

- `dist/es5` referenced from the package.json module field. This is ES5 with export/import suitable for use with Rollup/Webpack.
- `dist/bundles/index.umd.js` A UMD bundle. This is suitable for use in the browser and is referenced as `main` in `package.json`. We could easily build more/different bundles if there was demand (e.g. minimised, cjs).

The CircleCI config builds on master and should push to NPM for v-prefixed tags.
Nothing currently updates the package.json version or ensures it matches the tag. My preference would be to always update the version in CI to match what's being built using CI metadata.

## Initializing your project

Customise `package.json`. There should be no other references to the project name.

## Depending on projects created with this project

### Node

Add a dependency with npm, e.g. `npm install --save @microbit/typescript-library-starter`.

You can then import it as usual:

```javascript
const { fib } = require('@microbit/typescript-library-starter');

console.log(fib(8));
```

### Browser

Use a script tag to import the UMD bundle containing the library:

```
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Library demo</title>
  <script src="https://unpkg.com/@microbit/typescript-library-starter@0.0.0/dist/bundles/index.umd.js"></script>
</head>
<body>
<button onclick="javascript:alert(TypescriptLibraryStarter.fib(8))">Calculate fib(8)</button>
</body>
</html>
```

You can also download the JavaScript file to store alongside your own HTML page rather than using [unpkg](https://unpkg.com).

## Credits

This starter was derived from https://github.com/Hotell/typescript-lib-starter. It has since been significantly trimmed down, so if you're looking for more functionality that's a good place to start.
