# ⚙️ ember-cli-es6-transform

> Import ES6 modules from npm, bower or anywhere else in your Ember app.

## Requirements

`app.import` and custom `transformations` require `ember-cli@2.16+`.

## Why

`ember-cli@2.15` introduced the ability to import files from `node_modules`. `ember-cli@2.16` then gave us the ability to register and apply custom `importTransforms` to our imports. Currently, anything imported using `app.import` bypasses the Babel pipeline and is inserted into the final `vendor.js` sans transpilation. If your desired dependency is a shiny new ES6 module, the import will break your app. This addon leverages both concepts to pass your dependency through `ember-cli-babel`.

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

#### Importing more than one file at once *(risky)*

If you have several files to import, you could probably use a funnel. This won't resolve any dependencies for you though. If your imported file imports another file you forgot to include – you're out of luck. You would need a better build tool, like Rollup, for that. In your `ember-cli-build.js`:

```js
const Funnel = require('broccoli-funnel');
const { es6Transform } = require('ember-cli-es6-transform');

// Fetch your files.
let tree = new Funnel('node_modules/some-package', {
  include: ['some-folder/*.js']
});

// Pass a function to `getModuleId` define a custom module name.
// Let's remove the parent directories from the module name.
const babelOptions = {
  getModuleId: (moduleName) => moduleName.split('/').slice(2, -1).join('/')
};

// Run ember-cli-babel on the tree.
tree = es6Transform(tree, babelOptions);

// Add it to the app.
return app.toTree(tree);
```

#### Using Rollup *(untested)*

[WIP] This is completely untested, but should probably work.

```js
const Rollup = require('broccoli-rollup');

// Generate a tree with Rollup.
let tree = new Rollup(...);

// Transpile the tree.
tree = es6Transform(tree);

// Add it to the app.
return app.toTree(tree);
```

## Contributing

### Installation

* `git clone <repository-url>` this repository
* `cd ember-cli-es6-transform`
* `npm install`

### Running Tests

* `npm test`
