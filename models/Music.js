'use strict';
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let MusicSchema = new Schema({
    title: {
        type: String, required: 'Enter name of the song'
    },
    url: {type: String, required: 'Enter url'}
});

module.exports = mongoose.model('Music', MusicSchema);