var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
   res.send('ok ok');
});


router.get('/:userID', function(req, res, next) {
  res.send(req.params.userID);
});

module.exports = router;
