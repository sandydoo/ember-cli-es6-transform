# ⚙️ ember-cli-es6-transform

[![Build Status](https://travis-ci.org/sandydoo/ember-cli-es6-transform.svg?branch=master)](https://travis-ci.org/sandydoo/ember-cli-es6-transform)

> Import ES6 modules from npm, bower or anywhere else in your Ember app.

##### Table of contents

[Requirements](#requirements)  
[Why](#why)  
[Installation](#installation)  
[Usage](#usage)  
[I have a complex dependency](#i-have-a-complex-dependency)

## Requirements

`app.import` and custom `transformations` require `ember-cli@2.16+`.

## Why

Ember currently lacks official support for importing and transpiling external ES6 modules.

`ember-cli@2.15` introduced the ability to import files from `node_modules`. `ember-cli@2.16` then gave us the ability to register and apply custom `importTransforms` to our imports. Currently, anything imported using `app.import` bypasses the Babel pipeline and is inserted into the final `vendor.js` verbatim. If your desired dependency is a ✨shiny new ES6 module, the import will break your app. This addon leverages both concepts to pass your dependency through `ember-cli-babel`.

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

#### I have a complex dependency

If you want to import a complex, multi-file dependency, your best bet right now is to use `broccoli-rollup` together with [ember-cli-node-modules-to-vendor](https://github.com/kellyselden/ember-cli-node-modules-to-vendor).

## Contributing

### Installation

* `git clone <repository-url>` this repository
* `cd ember-cli-es6-transform`
* `yarn install`

### Running Tests

* `yarn test`
