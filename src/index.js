/* eslint-env node */
'use strict';

const es6Transform = require('./es6-transform');
const VersionChecker = require('ember-cli-version-checker');

module.exports = {
  name: 'ember-cli-es6-transform',

  es6Transform,

  init() {
    this._super.init && this._super.init.apply(this, arguments);

    let checker = new VersionChecker(this);
    let dep = checker.for('@babel/core').assertAbove('7.0.0', `
The current version of ember-cli-es6-transform@${this.pkg.version} is for \
Babel 7 and greater. Use versions below "1.0.0" for Babel 6.
    `)
  },

  importTransforms() {
    const babel = this.project.findAddonByName('ember-cli-babel');

    return {
      'es6': {
        transform(tree, options) {
          const babelOptions = babel.buildBabelOptions();
          return es6Transform(tree, options, babelOptions);
        },

        processOptions(assetPath, entry, options) {
          if (!entry.as) {
            throw new Error(
              `while importing ${assetPath}: ES6 transformation requires an \`as\` argument that specifies the desired module name`
            );
          }

          options[assetPath] = {
            as: entry.as
          };

          return options;
        }
      }
    }
  }
};
