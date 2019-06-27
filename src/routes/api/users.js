"use strict";

const express = require(`express`);
const router = express.Router();
const bcrypt = require(`bcryptjs`);
const jwt = require(`jsonwebtoken`);
const keys = require(`../../../config/keys`);
var passport = require(`passport`);

// Load input validation
const isRegisterInputValid = require(`../../validation/register`);
const isLoginInputValid = require(`../../validation/login`);
// Load User model
const User = require(`../../models/User`);
const { addErrorMessages, createErrorObject, hasErrors } = require(`../../utils/errorHandler`);

router.get(`/`, passport.authenticate(`jwt`, { session: false }), (req, res, next) => {
	const errorObject = createErrorObject();

	const id = req.user._id;

	if (!id) {
		addErrorMessages(errorObject, `Bad auth provided.`);
		return res.status(404).json(errorObject);
	}

	User.findOne({ _id: id }).then(user => {
		if (!user) {
			addErrorMessages(errorObject, `User not found`);
			return res.status(404).json(errorObject);
		} else {
			return res.status(200).json({
				username: user.username,
				email: user.email,
				lastModifiedDate: user.lastModifiedDate,
				roles: user.roles,
				createdDate: user.createdDate
			});
		}
	});
});

// @route POST api/users/register
// @desc Register user
// @access Public
router.post(`/register`, (req, res, next) => {
	let errorObject = createErrorObject();
	try {
		// Form validation
		const isValid = isRegisterInputValid(req.body, errorObject);
		// Check validation
		if (!isValid) {
			return res.status(400).json(errorObject);
		}

		// Check if email exists
		User.findOne({ email: req.body.email }, { upsert: false }).then(user => {
			if (user) {
				addErrorMessages(errorObject, `Email already exists`);
				return res.status(400).json(errorObject);
			}

			// Check is username exists
			User.findOne({ username: req.body.username }, { upsert: false }).then(user => {
				if (user) {
					addErrorMessages(errorObject, `Username already exists`);
					return res.status(400).json(errorObject);
				}

				if (hasErrors(errorObject)) {
					return res.status(400).json(errorObject);
				}

				const newUser = new User({
					email: req.body.email,
					password: req.body.password,
					username: req.body.username
				});
				// Hash password before saving in database
				bcrypt.genSalt(10, (err, salt) => {
					if (err) throw err;
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if (err) throw err;
						newUser.password = hash;
						newUser
							.save()
							.then(user => res.json(`Success! User created`))
							.catch(err => console.log(err));
					});
				});
			});
		});
	} catch (err) {
		addErrorMessages(errorObject, err);
		next(errorObject);
	}
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post(`/login`, (req, res) => {
	let errorObject = createErrorObject();
	// Form validation
	const isValid = isLoginInputValid(req.body, errorObject);
	// Check validation
	if (!isValid) {
		return res.status(400).json(errorObject);
	}
	const email = req.body.email;
	const password = req.body.password;
	// Find user by email
	User.findOne({ email }).then(user => {
		// Check if user exists
		if (!user) {
			addErrorMessages(errorObject, `Email not found`);
			return res.status(400).json(errorObject);
		}
		// Check password
		bcrypt.compare(password, user.password).then(isMatch => {
			if (isMatch) {
				// User matched
				// Create JWT Payload
				const payload = {
					id: user.id
				};
				// Sign token
				jwt.sign(
					payload,
					keys.secretOrKey,
					{
						expiresIn: 172800 // 1 year in seconds
					},
					(err, token) => {
						if (err) throw err;
						res.json({
							success: true,
							token: `Bearer ` + token,
							user: {
								username: user.username,
								email: user.email,
								lastModifiedDate: user.lastModifiedDate,
								roles: user.roles,
								createdDate: user.createdDate
							}
						});
					}
				);
			} else {
				addErrorMessages(errorObject, `Password incorrect`);
				return res.status(400).json(errorObject);
			}
		});
	});
});

// router.post(`/user/avatar`, passport.authenticate(`jwt`, ), (req, res) => {
// 	let errorObject = createErrorObject();
// 	const query = { email: req.user.email };
// 	User.findOneAndUpdate(
// 		query,
// 		{ imageUrl: req.imageUrl },
// 		{
// 			runValidators: true
// 		},

// 	);

// 	User.findOne({ email }).then(user => {
// 		if (!user) {
// 			addErrorMessages(errorObject, `User not found`);
// 			return res.status(400).json(errorObject);
// 		} else {
// 		}
// 	});
// });

module.exports = router;
