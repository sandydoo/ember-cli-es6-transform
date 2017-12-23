/* eslint-env node */
'use strict';

const BabelTranspiler = require('broccoli-babel-transpiler');

module.exports = {
  name: 'ember-cli-es6-transform',

  importTransforms() {
    const babel = this.project.findAddonByName('ember-cli-babel');
    return {
      'es6': {
        transform(tree, options) {
          const babelOptions = babel.buildBabelOptions({
            moduleIds: true,
            getModuleId: (moduleName) => {
              return options[`${moduleName}.js`].as;
            }
          });
          return new BabelTranspiler(tree, babelOptions);
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
