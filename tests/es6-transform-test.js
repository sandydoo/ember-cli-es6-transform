'use strict';

const co = require('co');
const BroccoliTestHelper = require('broccoli-test-helper');
const { createBuilder, createTempDir } = BroccoliTestHelper;

const es6Transform = require('../src/es6-transform');
const babel = require('ember-cli-babel');

const { module: describe, test: it } = QUnit;

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
          'foo.js': 'define(\"bar\", [\"module\"], function (module) {\n  \"use strict\";\n\n  module.exports = \"derp\";\n});',
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

        let customBabelOptions = Object.assign(babelOptions, {
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
  });
});