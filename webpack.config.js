const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: __dirname,
  entry: [path.resolve(__dirname, 'public', 'App.jsx')],
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.jsx$/,
      loader: 'babel-loader',
      options: {
        presets: ['es2015', 'react', 'stage-1']
      }
    }]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin()
  ],
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};
