'use strict';
var path = require('path');
var reqdir = require('require-dir');
var express = require('express');
var nunjucks  = require('nunjucks');
var nunjucksGlobals = require('nunjucks/src/globals');
var config = require('./config');
var routes = reqdir('./routes');
var views = path.join(__dirname, '/views');

nunjucksGlobals.urlencode = encodeURIComponent;

/**
 * Module provides application
 */
var app = module.exports = express();

// Set config
app.set('config', config);

// Add routes
app.use(routes.main);

// Configure views
var env = nunjucks.configure(views, {
  autoescape: true,
  express: app
});
env.addGlobal('email', config.get('contacts:email'));
env.addGlobal('interval', config.get('updates:interval'));
