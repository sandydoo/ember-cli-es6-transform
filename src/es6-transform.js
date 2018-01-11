/* eslint-env node */
'use strict';

const BabelTranspiler = require('broccoli-babel-transpiler');

module.exports = function(tree, babelOptions, options) {
  babelOptions = babelOptions || {};
  options = options || {};
  const defaultBabelOptions = {
    getModuleId: function(moduleName) {
      const assetOptions = options[`${moduleName}.js`];
      if (assetOptions) {
        return assetOptions.as;
      } else {
        return moduleName;
      }
    }
  };
  const _babelOptions = Object.assign({}, defaultBabelOptions, babelOptions);
  return new BabelTranspiler(tree, _babelOptions);
}
