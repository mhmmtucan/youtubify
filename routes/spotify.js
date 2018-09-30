
var express = require('express');
var router = express.Router();
let callbackController = require('../controllers/SpotifyController');

router.get('/callback', function (req, res, next) {
    callbackController.handleCallback(req, res, next, (err, result) => {
        if (err) {
            res.send(500, {error: 'something blew up'});
        } else {
            console.log("Sending result");
            res.send(result);
        }
    });
});

router.post('/checkstatus', function (req, res, next) {
    callbackController.checkStatus(req, res, next, (err, result) => {
        if (err) {
            res.send(500, {error: 'something blew up'});
        } else {
            console.log("Sending result");
            res.send(result);
        }
    });
});

module.exports = router;
