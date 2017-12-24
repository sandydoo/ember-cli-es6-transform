# ⚙️ ember-cli-es6-transform

> Import ES6 modules from npm, bower or anywhere else in your Ember app.

## Requirements

`app.import` and custom `transformations` require `ember-cli@2.16+`.

## Why

Ember currently lacks official support for importing and transpiling external ES6 modules.

`ember-cli@2.15` introduced the ability to import files from `node_modules`. `ember-cli@2.16` then gave us the ability to register and apply custom `importTransforms` to our imports. Currently, anything imported using `app.import` bypasses the Babel pipeline and is inserted into the final `vendor.js` verbatim. If your desired dependency is a ✨shiny new ES6 module, the import will break your app. This addon leverages both concepts to pass your dependency through `ember-cli-babel`.

There are also some advanced guides near the end to provide some ideas on how to import entire directories of files, given the limitations of `app.import`. Messing with broccoli trees is pretty low-level in the scope of Ember's ecosystem, so there isn't a ton of clear guidance out there on this stuff. Hopefully, someone will find this useful!

## Installation

`ember install ember-cli-es6-transform`

## Usage

#### Importing a single (file) dependency

Define the transformation when importing the ES6 module in your `ember-cli-build.js`. The syntax is the same as the built-in `amd` transform.
Remember that `app.import` only works one file at a time!

Options:

* `as` – (**required**) specify the module name.

```js
// Importing spin.js as spin.js

app.import('node_modules/spin.js/spin.js', {
  using: [
    { transformation: 'es6', as: 'spin.js' }
  ]
});
```

In your app, you can then import the module using the name you specified in `as`.

```js
import { Spinner } from 'spin.js';
```

#### Advanced 

You don't need the addon beyond this point unless you need the transformation. You can import and call the babel transpiler yourself. These are just tips on how to import and transpile more than one file.

#### Importing more than one file at once manually *(risky)* 😰

If you have several files to import, you could probably use a funnel. This won't resolve any dependencies for you though. If your imported file imports another file you forgot to include – you're out of luck. You would need a better build tool, like Rollup, for that. You can also end up importing more than you intended by being too careless here and going to town with globs. It's part of the reason why `app.import` only supports single file imports. In your `ember-cli-build.js`:

```js
const Funnel = require('broccoli-funnel');
const { es6Transform } = require('ember-cli-es6-transform');

// Fetch your files.
let tree = new Funnel('node_modules/some-package', {
  include: ['some-folder/*.js']
});

const babel = app.project.findAddonByName('ember-cli-babel');
const babelOptions = babel.buildBabelOptions();

// Pass a function `getModuleId` to define a custom module name.
// Let's remove the parent directories from the module name.
babelOptions['getModuleId'] = (moduleName) => {
  return moduleName.split('/').slice(2, -1).join('/');
};

// Run ember-cli-babel on the tree.
tree = es6Transform(tree, babelOptions);

// Add it to the app.
return app.toTree(tree);
```

#### Creating custom builds using Rollup

```js
const Rollup = require('broccoli-rollup');

// Generate a tree with Rollup.
let tree = new Rollup('node-modules/some-package', {
  rollup: {
    input: 'index.js',
    output: {
      file: 'out.js',
      format: 'es',
    }
  }
});

const babel = app.project.findAddonByName('ember-cli-babel');
const babelOptions = babel.buildBabelOptions();

// Transpile the tree.
tree = es6Transform(tree, babelOptions);

// Add it to the app.
return app.toTree(tree);
```

## Contributing

### Installation

* `git clone <repository-url>` this repository
* `cd ember-cli-es6-transform`
* `yarn install`

### Running Tests

* `yarn test`
