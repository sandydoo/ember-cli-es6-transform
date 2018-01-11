/* eslint-env node */
/* global QUnit */
'use strict';

const co = require('co');
const BroccoliTestHelper = require('broccoli-test-helper');
const createBuilder = BroccoliTestHelper.createBuilder;
const createTempDir = BroccoliTestHelper.createTempDir;
const Rollup = require('broccoli-rollup');

const es6Transform = require('../src/es6-transform');

const describe = QUnit.module;
const it = QUnit.test;

const babelOptions = {
  moduleIds: true,
  presets: ['babel-preset-env'],
  plugins: ['babel-plugin-transform-es2015-modules-amd']
};

describe('ember-cli-es6-transform', () => {
  describe('es6 transpilation', (hooks) => {
    let input, output;
    hooks.beforeEach(
      co.wrap(function*() {
        input = yield createTempDir();
      })
    );

    hooks.afterEach(
      co.wrap(function*() {
        yield input && input.dispose();
        yield output && output.dispose();
      })
    );

    it(
      'emits an AMD module',
      co.wrap(function*(assert) {
        let fooContents = 'module.exports = "derp";';

        input.write({
          'foo.js': fooContents,
        });

        let subject = es6Transform(input.path(), babelOptions, {
          'foo.js': { as: 'bar' }
        });

        output = createBuilder(subject);

        yield output.build();

        assert.deepEqual(output.read(), {
          'foo.js': 'define("bar", ["module"], function (module) {\n  "use strict";\n\n  module.exports = "derp";\n});',
        });
      })
    );

    it(
      'transpiles a directory of files',
      co.wrap(function*(assert) {
        let fooContents = "module.exports = 'herp';";

        input.write({
          'foo.js': fooContents,
          'bar.js': "module.exports = 'derp';"
        });

        let subject = es6Transform(input.path(), babelOptions);

        output = createBuilder(subject);

        yield output.build();

        let result = output.read();
        assert.ok(result['foo.js']);
        assert.ok(result['bar.js']);
        assert.ok(result['foo.js'].includes("define('foo'"));
        assert.ok(result['foo.js'].includes("define('foo'"));
      })
    );

    it(
      'renames modules using a custom function',
      co.wrap(function*(assert) {
        let fooContents = "module.exports = 'herp';";

        input.write({
          'foo.js': fooContents,
          'bar.js': "module.exports = 'derp';"
        });

        const customBabelOptions = Object.assign({}, babelOptions, {
          getModuleId: (moduleName) => `lib/${moduleName}`
        });

        let subject = es6Transform(input.path(), customBabelOptions);

        output = createBuilder(subject);

        yield output.build();

        let result = output.read();
        assert.ok(result['foo.js']);
        assert.ok(result['bar.js']);
        assert.ok(result['foo.js'].includes("define('lib/foo'"));
        assert.ok(result['foo.js'].includes("define('lib/foo'"));
      })
    );

    it(
      'transpiles a tree "rolled up" with Rollup',
      co.wrap(function*(assert) {
        let subject = new Rollup(input.path(), {
          rollup: {
            input: 'index.js',
            output: {
              file: 'out.js',
              format: 'es',
            },
          },
        });

        subject = es6Transform(subject, babelOptions);

        const output = createBuilder(subject);

        input.write({
          'data.js': 'export const data = Array(10).fill(5);',
          'adder.js': 'const adder = (accumulator, currentValue) => accumulator + currentValue; export default adder;',
          'index.js': 'import { data } from "./data"; import adder from "./adder"; const result = data.reduce(adder); export default result;',
        });

        yield output.build();

        assert.deepEqual(output.read(), {
          'out.js' : 'define("out", ["exports"], function (exports) {\n  "use strict";\n\n  Object.defineProperty(exports, "__esModule", {\n    value: true\n  });\n  var data = Array(10).fill(5);\n\n  var adder = function adder(accumulator, currentValue) {\n    return accumulator + currentValue;\n  };\n\n  var result = data.reduce(adder);\n\n  exports.default = result;\n});'
        });
      })
    );
  });
});