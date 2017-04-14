var express = require('express');
var router = express.Router();
var model = require('../app');

router.get('/synchronise', function(req, res){
  model.UserData.find().then(function(doc){
    console.log(doc);
    res.send(doc);
  });
});

module.exports = router;
