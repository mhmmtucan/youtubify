'use strict';

let mongoose = require('mongoose'), Music = mongoose.model('Music');

exports.processMusic = function (req, res) {
    console.log("processing music");
    res.send('ok');
};