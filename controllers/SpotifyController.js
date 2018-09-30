const request = require('request');
const SpotifyWebApi = require('spotify-web-api-node');
const mongoose = require("mongoose");
const User = require('../models/User');
mongoose.connect("mongodb://localhost:27017/test", {useNewUrlParser: true});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function (callback) {
    console.log("Connection succeeded.");
});

exports.handleCallback = function (req, res, next, cb) {
    console.log(req.query);

    let code = req.query['code'];
    let state_code = req.query['state'];

    let redirect_uri = 'http://localhost:3000/spotify/callback';
    let client_id = 'd87530d309cb49c6b30277d9d2c4cf83';
    let client_secret = '60e5a5fe0e404cf291826b91f8533ed6';
    let spotifyApi = new SpotifyWebApi();

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token,
                refresh_token = body.refresh_token;

            spotifyApi.setAccessToken(access_token);
            // use spotify api

            // Get the authenticated user
            spotifyApi.getMe()
                .then(function (data) {
                    console.log('Some information about the authenticated user', data.body['id']);
                    // add auth user to db if not exist
                    User.find({browserID: state_code}, function (err, foundData) {
                        if (foundData.length) {
                            console.log("user exists");
                            console.log(foundData);
                            // user exists
                        } else {
                            var user = new User({
                                spotifyID: data.body['id'],
                                browserID: state_code,
                                accessToken: access_token
                            });
                            user.save(function (err) {
                                if (err) console.log(err);
                            });
                        }
                    });

                }, function (err) {
                    console.log('Something went wrong!', err);
                });


        } else {
            console.log(error);
        }
    });
};

exports.checkStatus = function (req, res, next, f) {
    console.log(req.body);
    User.find({browserID: Object.keys(req.body)[0]}, function (err, foundData) {
        if (foundData.length) {
            // user exists
            res.send(true);
        } else {
            res.send(false);
        }
    });
};
