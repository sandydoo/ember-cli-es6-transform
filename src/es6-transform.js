/* eslint-env node */
'use strict';

const BabelTranspiler = require('broccoli-babel-transpiler');

module.exports = function(tree, options, babelOptions) {
  let originalGetModuleId;

  if (typeof babelOptions.getModuleId === 'function') {
    originalGetModuleId = babelOptions.getModuleId;

    // Fetch the method set by ember-cli-babel. It converts the `moduleName` to
    // a relative path.
  } else if (babelOptions.getModuleId && babelOptions.getModuleId._parallelBabel) {
    const relativePathLibInfo = babelOptions.getModuleId._parallelBabel;
    originalGetModuleId = require(relativePathLibInfo.requireFile)[relativePathLibInfo.useMethod];
  }

  function getModuleId(moduleName) {
    if (typeof originalGetModuleId === 'function') {
      moduleName = originalGetModuleId(moduleName);
    }

    let assetOptions = options[`${moduleName}.js`];

    if (assetOptions) {
      return assetOptions.as;
    } else {
      return moduleName;
    }
  }

  // Create a new copy of the options, just in case.
  let newBabelOptions = Object.assign({}, babelOptions, { getModuleId });

  return new BabelTranspiler(tree, newBabelOptions);
}
