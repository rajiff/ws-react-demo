const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const path = require('path');

let app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('../webpack.config.js');
const webpackCompiler = webpack(webpackConfig);

//  setup middlewares
app.use(webpackDevMiddleware(webpackCompiler, {
  noInfo: true,
  publicPath: webpackConfig.output.publicPath
}));
app.use(webpackHotMiddleware(webpackCompiler));

app.use(express.static(path.resolve(__dirname, '../', 'public')));

app.use(function(req, res) {
  return res.status(404).send({
    error: 'Resource not found..!'
  });
})

module.exports = app;
