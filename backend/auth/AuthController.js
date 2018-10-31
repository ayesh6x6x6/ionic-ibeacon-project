var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');
var verifyToken = require('./VerifyToken');

router.post('/register', function(req, res) {

    console.log('Received a request!');
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    
    User.create({
      username : req.body.username,
      email : req.body.email,
      password : hashedPassword,
      favItems: [],
      orderHistory: []
    },
    function (err, user) {
      if (err) return res.status(500).send("There was a problem registering the user.")
      // create a token
      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });
      

      console.log("Created a user!");
      res.status(200).send({ auth: true, token: token });
    }); 
});

router.get('/me', verifyToken ,function(req, res) {
      
      User.findOne(req.body.email, {password:0}, function (err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        
        res.status(200).send(user);
      });
});

router.post('/login', function(req, res) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });
    res.status(200).json({ auth: true, token: token, username: user.username, email: user.email });
  });
});

router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});


module.exports = router;