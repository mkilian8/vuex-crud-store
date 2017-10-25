const path = require('path');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const defaultConf = {
  resolve: {
    alias: {
      fs: 'empty',
      module: 'empty',
      vue: 'vue/dist/vue.js',
    }
	},
  entry: './crud_store.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: 'dist/',
    filename: 'build.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  }
};


const testConf = {
  plugins: [
    new CopyWebpackPlugin([
      'test/test.html',
      { from: 'node_modules/mocha/mocha.js', to: 'vendor/mocha/' },
      { from: 'node_modules/mocha/mocha.css', to: 'vendor/mocha/' }
    ], { copyUnmodified: true })
  ],
  entry: './test/test.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: 'dist/',
    filename: 'testbuild.js'
  }
};


if (process.env.NODE_ENV == 'test') {
  console.log('Building test');
  module.exports = Object.assign({}, defaultConf, testConf)
  return
}

module.exports = defaultConf;


