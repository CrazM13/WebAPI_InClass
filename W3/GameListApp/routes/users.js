const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Load user Model
require('../models/Users');
const User = mongoose.model('Users');

// Route To Register User
router.get('/register', function(req, res) {
	res.render('users/register');
});

router.post('/register', function(req, res) {
	
	var errors = [];
	if (req.body.password != req.body.password2) errors.push({text:"Passwords do not match"});
	if (req.body.password.length < 4) errors.push({text:"Password must be at least 4 characters"});

	if (errors.length > 0) {
		//req.flash("error_msg", "We have Errors");
		res.render('users/register', {
			errors: errors,
			name: req.body.name,
			email: req.body.email,
			password1: req.body.password,
			password2: req.body.password2
		});
	} else {
		User.findOne({email: req.body.email}).then(function(user) {
			if (user) {
				// #ADD_FLASH_MSG
				res.redirect('/users/register');
			} else {
				var newUser = new User({
					name: req.body.name,
					email: req.body.email,
					password: req.body.password
				});

				bcrypt.genSalt(10, function(err, salt) {
					bcrypt.hash(newUser.password, salt, function(err, hash) {
						if (err) throw err;
						newUser.password = hash;

						newUser.save().then(function(user) {
							//#ADD_FLASH_MESSAGE
						 	res.redirect('/login');
						}).catch(function(err) {
							console.log(err);
							return;
						});
					});
				});

			}
		});
	}

	// var newUser = {
	// 	name: req.body.name,
	// 	email: req.body.email,
	// 	password: req.body.password
	// };

	// new User(newUser).save().then(function(user) {
	// 	res.redirect('/');
	// });
	
});

module.exports = router;