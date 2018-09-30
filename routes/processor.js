'use strict';

let express = require('express');
let router = express.Router();
let videoProcessor = require('../controllers/ProcessorController');


router.get('/:videoUrl', function (req, res, next) {
    videoProcessor.processMusic(next, req.params.videoUrl, (err, result) => {
        if (err) {
            res.send(500, {error: 'something blew up'});
        } else {
            console.log("Sending result");
            res.send(result);
        }
    });

});

module.exports = router;