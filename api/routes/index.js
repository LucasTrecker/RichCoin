var express = require('express');
var router = express.Router();

/* GET home page. */
//Nach build react app kann man hier die index.html integrieren
router.get('/', function(req, res, next) {
  express.static('public');
});

module.exports = router;
