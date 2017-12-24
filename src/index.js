/* eslint-env node */
'use strict';

const es6Transform = require('./es6-transform');

module.exports = {
  name: 'ember-cli-es6-transform',

  es6Transform,

  importTransforms() {
    const babel = this.project.findAddonByName('ember-cli-babel');
    return {
      'es6': {
        transform(tree, options) {
          const babelOptions = babel.buildBabelOptions();
          es6Transform(tree, babelOptions, options);
        },

        processOptions(assetPath, entry, options) {
          if (!entry.as) {
            throw new Error(
              `while importing ${assetPath}: ES6 transformation requires an \`as\` argument that specifies the desired module name`
            );
          }

          options[assetPath] = {
            as: entry.as,
          };

          return options;
        }
      }
    }
  }
};