/* eslint-env node */
/* global QUnit */
'use strict';

const path = require('path');
const fs = require('fs');
const co = require('co');
const BroccoliTestHelper = require('broccoli-test-helper');
const createBuilder = BroccoliTestHelper.createBuilder;
const createTempDir = BroccoliTestHelper.createTempDir;

const es6Transform = require('../src/es6-transform');

const describe = QUnit.module;
const it = QUnit.test;

const babelOptions = {
  moduleIds: true,
  getModuleId: (modulePath) => path.relative(process.cwd(), modulePath),
  presets: ['@babel/preset-env'],
  plugins: ['babel-plugin-transform-es2015-modules-amd'],
};

describe('ember-cli-es6-transform', () => {
  function evaluateModules(filePath) {
    let contents = fs.readFileSync(filePath, { encoding: 'utf-8' });

    return new Function(`
      'use strict';
      let exports = {};
      let result = { exports };
      function define(moduleName, deps, callback) {
        result.name = moduleName;
        if (callback === undefined) {
          result.deps = [];
          result.callback = deps;
        } else {
          result.deps = deps;
          result.callback = callback;
        }
        callback(exports);
      }
      ${contents};
      return result;
    `)();
  }

  describe('es6 transpilation', (hooks) => {
    let input, output;
    hooks.beforeEach(
      co.wrap(function*() {
        input = yield createTempDir();
      })
    );

    hooks.afterEach(function() {
      return Promise.all([
        input && input.dispose(),
        output && output.dispose(),
      ]);
    });

    it(
      'emits an AMD module',
      co.wrap(function*(assert) {
        let fooContents = 'export default "derp"';

        input.write({
          'foo.js': fooContents,
        });

        let subject = es6Transform(input.path(), { 'foo.js': { as: 'bar' } }, babelOptions);

        output = createBuilder(subject);

        yield output.build();

        let results = evaluateModules(output.path('foo.js'));

        assert.equal('bar', results.name);
        assert.deepEqual(results.exports, { default: 'derp'});
      })
    );

    it(
      'renames modules using a custom function',
      co.wrap(function*(assert) {
        input.write({
          'foo.js': 'export default "derp"',
        });

        const customBabelOptions = Object.assign({}, babelOptions, {
          getModuleId: (moduleName) => `lib/${babelOptions.getModuleId(moduleName)}`
        });

        let subject = new es6Transform(input.path(), {}, customBabelOptions);

        output = createBuilder(subject);

        yield output.build();

        let results = evaluateModules(output.path('foo.js'));

        assert.ok(results.name, 'lib/foo.js');
      })
    );
  });
});
