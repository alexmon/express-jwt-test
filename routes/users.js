var express = require('express');
var router = express.Router();

var User = require('../models/user.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
    var users = User.find(
        {},
        function (err, docs) {
            res.json(docs);
        }
    );
});

module.exports = router;
