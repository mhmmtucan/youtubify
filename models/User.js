'use strict';
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema({
    spotifyID: {type: String, required: 'SpotifyID of user'},
    browserID: {type: String, required: 'browserID of user'},
    accessToken: {type: String, required: 'Access code of authentication'}
});

module.exports = mongoose.model('User', UserSchema);