var express = require('express');
var router = express.Router();
var BoardContents = require('../models/boardsSchema');


router.get('/', function(req,res){
    BoardContents.find({}).sort({date:-1}).exec(function(err, rawContents){
        if(err) throw err;
        res.render('board', {title: "Board", contents: rawContents}); 
    });
});

module.exports = router;