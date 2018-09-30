var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var spotfiyRouter = require('./routes/spotify');
var processRouter = require('./routes/processor');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/spotify', spotfiyRouter);
app.use('/v',   processRouter);

module.exports = app;
