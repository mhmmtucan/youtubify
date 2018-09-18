var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    //res.setHeader('Content-Type', 'application/json');
    // res.send(JSON.stringify({ status: 'ok'}));
    res.jsonp({status: 'ok'});
});


router.get('/:userID', function(req, res, next) {
    res.send(req.params.userID);
});

module.exports = router;
