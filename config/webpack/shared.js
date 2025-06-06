// Note: You must restart bin/webpack-dev-server for changes to take effect

/* eslint global-require: 0 */
/* eslint import/no-dynamic-require: 0 */

const webpack = require('webpack');
const { basename, dirname, join, resolve } = require('path');
const { sync } = require('glob');
const ManifestPlugin = require('webpack-manifest-plugin');
const extname = require('path-complete-extname');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const { SplitChunksPlugin } = require('webpack').optimize;
const { execSync } = require('child_process');

const { env, settings, i18n, output, engines } = require('./configuration.js');
const loaders = require('./loaders.js');
const RailsEnginesPlugin = require('./RailsEnginesPlugin');

const extensionGlob = `**/*{${settings.extensions.join(',')}}*`; // */
const entryPath = join(settings.source_path, settings.source_entry_path);
const moduleDir = engines['manageiq-ui-classic'].node_modules;

const gettextDir = i18n;

const sharedPackages = [
  '@carbon/icons-react',
  'angular',
  'carbon-components-react',
  'connected-react-router',
  'jquery',
  'lodash',
  'moment',
  'prop-types',
  'react',
  'react-bootstrap',
  'react-dom',
  'react-redux',
  'react-router',
  'react-router-dom',
  'redux',
];

let packPaths = {};

Object.keys(engines).forEach(function(k) {
  let root = engines[k].root;
  let glob = join(root, entryPath, extensionGlob);
  packPaths[k] = sync(glob);
});

const nodeModulesNotShims = (module) => {
  const inNodeModules = SplitChunksPlugin.checkTest(/node_modules/, module);
  const inShims = SplitChunksPlugin.checkTest(/shims/, module);

  return inNodeModules && !inShims;
};
const notShims = (module) => (!SplitChunksPlugin.checkTest(/shims/, module));

let plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || 'development'),
    'process.env.CYPRESS': JSON.stringify(env.CYPRESS),
  }),

  new ManifestPlugin({
    publicPath: output.publicPath,
    writeToFileEmit: true,
  }),

  // plugin to output timestamp after compilation (useful for --watch)
  {
    apply(compiler) {
      compiler.hooks.done.tap('done timestamp', () => {
        // setTimeout to append instead of prepend the date
        setTimeout(() => console.log('webpack: done', new Date()));
      });
    },
  },
];

if (env.WEBPACK_VERBOSE) {
  plugins.push(new DuplicatePackageCheckerPlugin({
    verbose: true,
    showHelp: false,
  }));
}

const resolveModule = (...name) => resolve(dirname(__filename), '../../node_modules', ...name);

module.exports = {
  entry: {
    ...Object.keys(packPaths).reduce(
      (map, pluginName) => {
        packPaths[pluginName].forEach(function(entry) {
          map[join(pluginName, basename(entry, extname(entry)))] = resolve(entry);
        });
        return map;
      }, {}
    ),
    'shims': [
      'es6-shim',
      'array-includes',
      'whatwg-fetch',
      'core-js/stable',
      'regenerator-runtime/runtime',
    ],
  },

  output: {
    filename: '[name]-[chunkhash].js',
    path: output.path,
    publicPath: output.publicPath,
  },

  module: {
    rules: loaders,
  },

  plugins,

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      minChunks: 1,
      minSize: 0,
      cacheGroups: {
        vendor: {
          chunks: 'all',
          name: 'vendor',
          priority: -10,
          reuseExistingChunk: true,
          test: nodeModulesNotShims,
        },
        default: {
          chunks: 'all',
          minChunks: 2,
          name: 'vendor',
          priority: -20,
          reuseExistingChunk: true,
          test: notShims,
        },
      },
    },
  },

  resolve: {
    alias: {
      ...sharedPackages.reduce((acc, pkg) => ({ ...acc, [pkg]: resolveModule(pkg) }), {}),
      'bootstrap-select': '@pf3/select', // never use vanilla bootstrap-select
      '@patternfly/patternfly': resolveModule('NONEXISTENT'),
      '@patternfly/patternfly-next': resolveModule('NONEXISTENT'),
      '@@ddf': resolve(dirname(__filename), '../../app/javascript/forms/data-driven-form'),
      'gettext_i18n_rails_js': gettextDir,
    },
    extensions: settings.extensions,
    modules: [],
    plugins: [
      new RailsEnginesPlugin('module', 'resolve', engines, moduleDir),
    ],
  },

  resolveLoader: {
    // only read loaders from ui-classic
    modules: [moduleDir],
  },

  watchOptions: {
    ignored: ['**/.*.sw[po]'],
  },
};
