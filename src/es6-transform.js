/* eslint-env node */
'use strict';

const BabelTranspiler = require('broccoli-babel-transpiler');

module.exports = function(tree, babelOptions = {}, options = {}) {
  const defaultBabelOptions = {
    getModuleId: (moduleName) => {
      const assetOptions = options[`${moduleName}.js`];
      if (assetOptions) {
        return assetOptions.as;
      } else {
        return moduleName;
      }
    }
  };
  const _babelOptions = Object.assign(defaultBabelOptions, babelOptions);
  return new BabelTranspiler(tree, _babelOptions);
}