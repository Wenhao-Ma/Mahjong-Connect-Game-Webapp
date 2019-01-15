const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/key');
const passport = require('passport');
const formidable = require('formidable');
const fs = require('fs');
const nodemailer = require('nodemailer');

//load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
const isEmpty = require('../../validation/is-empty');

// avatar upload folder
const AVATAR_UPLOAD_FOLDER = '../../upload/avatar/';

// load User model
const User = require('../../models/User');

// @route   POST /users/send
// @desc    send user email
// @access  Public
router.post('/send', (req, res) => {
  const {errors, isValid} = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({email: req.body.email})
  .then(user => {
    if (user) {
      errors.email = 'email already exists';
      return res.status(400).json(errors);
    }
    else {
      const newUser = new User({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
        });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save()
          })
      });

      const saltRounds = 10;
      //salt for email
      const salt = bcrypt.genSaltSync(saltRounds);
      //hash value for email
      var hash_salt = bcrypt.hashSync(req.body.email, salt);

      // Set SMTP service account from gmail.email
      let smtpConfig = {
        pool: true,
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use TLS
        auth: {
          user: keys.emailuser,
          pass: keys.emailpass
        }
      };
      
      let transporter = nodemailer.createTransport(smtpConfig);
      let host = req.headers.referer;
      let mailOptions = {
        from: '"Mahjong Connection Game" <' + keys.emailuser + '>', // sender address
        to: req.body.email, // list of receivers
        subject: 'Hello from Mahjong Connection Game', // Subject line
        
        text: 'Hi ' + req.body.username +'! Please verify your email address using the following link: ' + host + '/validate/' + '?email='+ req.body.email +'&salt='+ hash_salt // plain text body
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
      });
      return res.json(hash_salt);
    }
  })
});


router.post('/register', (req, res) => {
  const {errors, isValid} = validateRegisterInput(req.body);
  if(!isValid){
    return res.status(400).json(errors);
  }
  User.findOne({email: req.body.email})
    .then(user => {
      if (user) {
        errors.email = 'email already exists';
        return res.status(400).json(errors);
      }
      else {
        const newUser = new User({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
        });
         bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          });
        });
      }
    });
});


// @route   POST /users/validate
// @desc    Register user
// @access  Public
router.post('/validate', (req, res) => {
    let email = req.body.email;
    let salt = req.body.salt;
    bcrypt.compare(email, salt)
    .then(isMatch => {
      if (isMatch) {
        User.findOne({email: email})
        .then(user => {
          user.isActivate = true;
          user.save()
          .then(res.json(user));
        })
      }
      else {
        res.status(400);
      }
    });
});

// @route   POST /users/login
// @desc    Login User / returning JWT Token
// @access  Public
router.post('/login', (req, res) => {
  const {errors, isValid} = validateLoginInput(req.body);
  // console.log(errors)
  if(!isValid){
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;
  //find the user by email
  User.findOne({email: email})
    .then(user => {
      //check for user
      if (!user){
        errors.email = 'user not found';
        return res.status(404).json(errors);
      }
      /*
      if (!user.isActivate) {
        errors.email = 'user not activated';
        return res.status(404).json(errors);
      }
      */
      //    check pw
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            //user matched
            //create payload
            const payload = {id: user.id, username: user.username, avatar: user.avatar};
            //sign token
            jwt.sign(payload, keys.secretOrKey, {expiresIn: 3600 * 5}, (err, token) => {
              res.json({
                success: true,
                token: 'Bearer ' + token
              });
            });
          }

          else{
            errors.password = 'password incorrect';
            return res.status(400).json(errors);
          }
        });
    });
});

// @route   GET /users/current
// @desc    return current user
// @access  Private
router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
  // res.json({msg: "success"});
  res.json({id: req.user.id, username: req.user.username, email: req.user.email});
});

//@route      post /users/edit_profile
//@desc       return to lobby
//@access     Private
router.post('/edit_profile',
    passport.authenticate("jwt", { session: false }),
    (req, res) => {

  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const username = req.body.username;
  const age = req.body.age;
  const location = req.body.location;
  const self_introduction = req.body.self_introduction;
  const facebookid = req.body.facebookid;

  if (isEmpty(username)) {
    return res.status(400).json("username is empty");
  }

  User.findById(req.user.id)
      .then(user =>{
        user.firstname = firstname;
        user.lastname = lastname;
        user.username = username;
        user.age = age;
        user.location = location;
        user.self_introduction = self_introduction;
        user.facebookid = facebookid;
        user.save().then(user => res.json(user)).catch(err => console.log(err));
      })
      .catch(err => res.status(400).json({err: "err"}));
});

//@route      post /users/avatar
//@desc       add a new avatar
//@access     Private
router.post('/avatar',
  passport.authenticate("jwt", {session: false}),
  (req, res) => {
    let form = new formidable.IncomingForm();   // create uploading form

    form.encoding = 'utf-8';    // encoding way
    form.uploadDir = __dirname + "/" + AVATAR_UPLOAD_FOLDER;  // upload dir
    form.keepExtensions = true;  //keep suffix
    form.maxFieldsSize = 2 * 1024 * 1024;   //max size of file

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.log(err);
        return;
      }
      let extName = '';  //后缀名

      switch (files.avatar.type) {
        case 'image/pjpeg':
          extName = 'jpg';
          break;
        case 'image/jpeg':
          extName = 'jpg';
          break;
        case 'image/png':
          extName = 'png';
          break;
        case 'image/x-png':
          extName = 'png';
          break;
      }
      if (extName.length === 0) {
        console.log('only support .png and .jpg images');
        return;
      }

      const avatarName = Math.random() + '.' + extName;
      const newPath = form.uploadDir + avatarName;

      console.log(newPath);
      fs.renameSync(files.avatar.path, newPath);

      User.findById(req.user.id)
        .then(user => {
          user.avatar = avatarName;
          user.save().then(user => res.json(user));
        })
        .catch(err => res.status(400).json({err: "err"}));
    });
  }
);


//@route      post /users/get-avatar/:user_id
//@desc       return a avatar
//@access     Public
router.get('/get-avatar/:user_id',
  (req, res) => {
    User.findById(req.params.user_id)
      .then(user => {
        const avatar = user.avatar;
        res.sendFile(__dirname + "/" + AVATAR_UPLOAD_FOLDER + avatar, {'root': '/'});
      })
  }
);

module.exports = router;