"use strict";

const express = require(`express`);
const router = express.Router();
const bcrypt = require(`bcryptjs`);
const jwt = require(`jsonwebtoken`);
var passport = require(`passport`);

// Emails
const sgMail = require(`@sendgrid/mail`);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Load input validation
const isRegisterInputValid = require(`../../validation/register`);
const isLoginInputValid = require(`../../validation/login`);
const isUpdateUserInputValid = require(`../../validation/updateUser`);
const isUpdatePasswordInputValid = require(`../../validation/updatePassword`);

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

	User.findOne({ _id: id }, { upsert: false }).then(user => {
		if (!user) {
			addErrorMessages(errorObject, `User not found`);
			return res.status(404).json(errorObject);
		} else {
			console.log(user);
			return res.status(200).json({
				username: user.username,
				email: user.email,
				createdAt: user.createdAt,
				roles: user.roles,
				updatedAt: user.updatedAt,
				imageUrl: user.imageUrl,
				color: user.color,
				_id: user._id
			});
		}
	});
});

router.post(`/`, passport.authenticate(`jwt`, { session: false }), (req, res, next) => {
	const errorObject = createErrorObject();

	const userId = req.user.id;
	const idToUpdate = req.query.id;

	if (!userId) {
		addErrorMessages(errorObject, `Bad auth provided.`);
		return res.status(404).json(errorObject);
	}

	if (userId !== idToUpdate) {
		addErrorMessages(errorObject, `You can only update your own user information.`);
		return res.status(404).json(errorObject);
	}

	try {
		// Form validation
		const isValid = isUpdateUserInputValid(req.body, errorObject);
		// Check validation
		if (!isValid) {
			return res.status(400).json(errorObject);
		}

		const email_lower = req.body.email.toLowerCase();

		// Check if email exists
		User.findOne({ email: email_lower }, { upsert: false }).then(user => {
			if (user && user.id !== userId) {
				addErrorMessages(errorObject, `Email already exists`);
			}

			const username_lower = req.body.username.toLowerCase();

			User.findOne({ username_lower }, { upsert: false }).then(usernameUser => {
				if (usernameUser && usernameUser.id !== userId) {
					addErrorMessages(errorObject, `Username already exists`);
				}

				if (hasErrors(errorObject)) {
					return res.status(400).json(errorObject);
				}

				if (req.body.email) {
					req.user.email = email_lower;
				}

				if (req.body.username) {
					req.user.username = req.body.username;
					req.user.username_lower = username_lower;
				}

				if (req.body.imageUrl) {
					req.user.imageUrl = req.body.imageUrl;
				}

				if (req.body.color) {
					req.user.color = req.body.color;
				}

				req.user
					.save()
					.then(user => {
						res.status(200).json({
							username: user.username,
							email: user.email,
							updatedAt: user.updatedAt,
							roles: user.roles,
							createdAt: user.createdAt,
							imageUrl: user.imageUrl,
							color: user.color,
							_id: user._id
						});
					})
					.catch(err => {
						addErrorMessages(errorObject, err.message);
						return res.status(400).json(errorObject);
					});
			});
		});
	} catch (err) {
		addErrorMessages(errorObject, err);
		next(errorObject);
	}
});

router.post(`/password`, passport.authenticate(`jwt`, { session: false }), (req, res, next) => {
	const errorObject = createErrorObject();

	const userId = req.user.id;
	const idToUpdate = req.query.id;

	if (!userId) {
		addErrorMessages(errorObject, `Bad auth provided.`);
		return res.status(404).json(errorObject);
	}

	if (userId !== idToUpdate) {
		addErrorMessages(errorObject, `You can only update your own password.`);
		return res.status(404).json(errorObject);
	}

	try {
		// Form validation
		const isValid = isUpdatePasswordInputValid(req.body, errorObject);
		// Check validation
		if (!isValid) {
			return res.status(400).json(errorObject);
		}

		bcrypt.genSalt(10, (err, salt) => {
			// Hash password before saving in database
			if (err) throw err;
			bcrypt.hash(req.body.password, salt, (err, hash) => {
				if (err) throw err;
				req.user.password = hash;
				req.user
					.save()
					.then(updatedUser => {
						const payload = {
							id: updatedUser.id,
							hashedPass: updatedUser.password
						};
						// Sign token
						jwt.sign(
							payload,
							process.env.SECRET_KEY,
							{
								expiresIn: 172800 // 1 year in seconds
							},
							(err, token) => {
								if (err) throw err;
								res.json({
									success: true,
									token: `Bearer ` + token
								});
							}
						);
					})
					.catch(err => {
						throw err;
					});
			});
		});
	} catch (err) {
		addErrorMessages(errorObject, err);
		next(errorObject);
	}
});

router.post(`/password/update`, (req, res, next) => {
	const errorObject = createErrorObject();

	const token = req.body.token;

	if (!token) {
		addErrorMessages(errorObject, `Invalid token provided`);
		return res.status(401).json(errorObject);
	}

	try {
		jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
			if (err) {
				addErrorMessages(errorObject, `Failed to authenticate token.`);
				return res.status(401).json(errorObject);
			}

			if (decoded && decoded.userId) {
				const id = decoded.userId;

				User.findOne({ _id: id }).then(user => {
					// Check if user exists
					if (!user) {
						addErrorMessages(errorObject, `Failed to authenticate token.  User was not found.`);
						return res.status(401).json(errorObject);
					}

					if (user.verificationToken !== token) {
						addErrorMessages(errorObject, `Failed to authenticate token.`);
						return res.status(401).json(errorObject);
					}

					bcrypt.genSalt(10, (err, salt) => {
						// Hash password before saving in database
						if (err) throw err;
						bcrypt.hash(req.body.password, salt, (err, hash) => {
							if (err) throw err;
							user.password = hash;
							user.verificationToken = ``;
							user.save()
								.then(updatedUser => {
									res.status(200).json(`Successfully reset password.  Please login`);
								})
								.catch(err => {
									throw err;
								});
						});
					});
				});
			}
		});
	} catch (err) {
		addErrorMessages(errorObject, err);
		next(errorObject);
	}
});

const createVerificationToken = (user, errorObject, res) => {
	// Create a verification token for this user
	const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
		expiresIn: 86400
	});

	return token;
};

const sendVerificationEmail = (user, errorObject, res, req) => {
	if (user.isVerified) {
		res.status(200).send(`A verification email has been sent to ` + user.email + `. Check your spam.`);
	}

	var email = {
		from: `no-reply@weebsandotakus.com`,
		to: user.email,
		subject: `Account Verification`,
		dynamic_template_data: {
			username: user.username,
			verificationUrl: req.headers.origin + `/verify/` + user.verificationToken
		},
		template_id: `d-58838a91d5bc48e6ac85a6ba95ec01ce`
		// text: `Hello,\n\n` + `Please verify your account by clicking the link: \nhttp://` + req.headers.origin + `/confirmation/` + token + `.\n`
	};

	// Send the email
	sgMail.send(email, err => {
		if (err) {
			addErrorMessages(errorObject, `Error ocurred while sending email.  Please contact administrators.`);
			console.log(`Error: Registration Email: `, err);
			return res.status(500).json(errorObject);
		}

		res.status(200).send(`A verification email has been sent to ` + user.email + `. Check your spam.`);
	});
};

const sendPasswordResetEmail = (user, errorObject, res, req) => {
	var email = {
		from: `no-reply@weebsandotakus.com`,
		to: user.email,
		subject: `Password Reset`,
		dynamic_template_data: {
			username: user.username,
			passwordResetUrl: req.headers.origin + `/password-change/` + user.verificationToken
		},
		template_id: `d-52babe08053c4c8699ab74081a7f20d3`
	};

	sgMail.send(email, err => {
		if (err) {
			addErrorMessages(errorObject, `Error ocurred while sending email.  Please contact administrators.`);
			console.log(`Error: Password Reset Email: `, err);
			return res.status(500).json(errorObject);
		}

		res.status(200).send(`A password reset email has been sent to ` + user.email + `. Check your spam.`);
	});
};

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
			}

			User.findOne({ username: req.body.username }, { upsert: false }).then(user => {
				if (user) {
					addErrorMessages(errorObject, `Username already exists`);
				}

				if (hasErrors(errorObject)) {
					return res.status(400).json(errorObject);
				}

				const username_lower = req.body.username.toLowerCase();

				// Check is username exists
				User.findOne({ username_lower }, { upsert: false }).then(user => {
					if (user) {
						addErrorMessages(errorObject, `Username already exists`);
						return res.status(400).json(errorObject);
					}

					if (hasErrors(errorObject)) {
						return res.status(400).json(errorObject);
					}

					const newUser = new User({
						email: req.body.email.toLowerCase(),
						password: req.body.password,
						username: req.body.username,
						username_lower: username_lower,
						color: req.body.color
					});

					// Hash password before saving in database
					bcrypt.genSalt(10, (err, salt) => {
						if (err) throw err;
						bcrypt.hash(newUser.password, salt, (err, hash) => {
							if (err) throw err;
							newUser.password = hash;
							newUser
								.save()
								.then(user => {
									user.verificationToken = createVerificationToken(user, errorObject, res);
									user.save()
										.then(updatedUser => {
											sendVerificationEmail(user, errorObject, res, req);
										})
										.catch(err => {
											throw err;
										});
								})
								.catch(err => {
									throw err;
								});
						});
					});
				});
			});
		});
	} catch (err) {
		addErrorMessages(errorObject, err);
		next(errorObject);
	}
});

router.post(`/verify`, (req, res, next) => {
	const token = req.headers[`x-access-token`];
	let errorObject = createErrorObject();

	if (!token) {
		addErrorMessages(errorObject, `Confirmation token not provided`);
		return res.status(401).json(errorObject);
	}

	try {
		jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
			if (err) {
				addErrorMessages(errorObject, `Failed to authenticate token.`);
				return res.status(401).json(errorObject);
			}

			if (decoded && decoded.userId) {
				const id = decoded.userId;

				User.findOne({ _id: id }).then(user => {
					// Check if user exists
					if (!user) {
						addErrorMessages(errorObject, `Failed to authenticate token.  User was not found.`);
						return res.status(401).json(errorObject);
					}

					if (user.isVerified) {
						return res.status(200).json(`User is already verified.`);
					}

					if (user.verificationToken !== token) {
						addErrorMessages(errorObject, `Invalid token`);
						return res.status(401).json(errorObject);
					}

					user.isVerified = true;
					user.verificationToken = ``;
					user.save().then(() => {
						return res.status(200).send(`Email verified! Please login`);
					});
				});
			}
		});
	} catch (err) {
		addErrorMessages(errorObject, err);
		next(errorObject);
	}
});

router.post(`/verify/resend`, (req, res, next) => {
	let errorObject = createErrorObject();

	let email = req.body.email;

	if (!email) {
		addErrorMessages(errorObject, `Email is required`);
		return res.status(400).json(errorObject);
	}

	User.findOne({ email }, { upsert: false }).then(user => {
		if (!user) {
			return res.status(200).json(`A verification email has been sent to ` + email + `. Check your spam.`);
		}

		if (user.isVerified) {
			addErrorMessages(errorObject, `Email address is already verified.`);
			return res.status(400).json(errorObject);
		}

		user.verificationToken = createVerificationToken(user, errorObject, res);
		user.save()
			.then(user => {
				sendVerificationEmail(user, errorObject, res, req);
			})
			.catch(err => {
				addErrorMessages(errorObject, err);
				return res.status(401).json(errorObject);
			});
	});
});

router.post(`/password/reset`, (req, res, next) => {
	let errorObject = createErrorObject();

	let email = req.body.email;

	if (!email) {
		addErrorMessages(errorObject, `Email is required`);
		return res.status(400).json(errorObject);
	}

	User.findOne({ email }, { upsert: false }).then(user => {
		if (!user) {
			return res.status(200).json(`A password reset email has been sent to ` + email + `. Check your spam.`);
		}

		user.verificationToken = createVerificationToken(user, errorObject, res);
		user.save()
			.then(user => {
				return sendPasswordResetEmail(user, errorObject, res, req);
			})
			.catch(err => {
				addErrorMessages(errorObject, err);
				return res.status(401).json(errorObject);
			});
	});
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post(`/login`, (req, res) => {
	let errorObject = createErrorObject();
	console.log(`About to validate`);
	// Form validation
	const isValid = isLoginInputValid(req.body, errorObject);
	// Check validation
	if (!isValid) {
		console.log(`Not Valid`);
		return res.status(400).json(errorObject);
	}
	const email = req.body.email.toLowerCase();
	const password = req.body.password;
	// Find user by email
	User.findOne({ email }).then(user => {
		// Check if user exists
		if (!user) {
			addErrorMessages(errorObject, `Email not found`);
			return res.status(401).json(errorObject);
		}

		// Check password
		bcrypt.compare(password, user.password).then(isMatch => {
			if (isMatch) {
				if (!user.isVerified) {
					addErrorMessages(errorObject, `Your account has not been verified`);
					return res.status(401).json(errorObject);
				}

				// User matched
				// Create JWT Payload
				const payload = {
					id: user.id,
					hashedPass: user.password
				};
				// Sign token
				jwt.sign(
					payload,
					process.env.SECRET_KEY,
					{
						expiresIn: 604800 // 1 year in seconds
					},
					(err, token) => {
						if (err) throw err;
						res.json({
							success: true,
							token: `Bearer ` + token,
							user: {
								username: user.username,
								email: user.email,
								updatedAt: user.updatedAt,
								roles: user.roles,
								createdAt: user.createdAt,
								imageUrl: user.imageUrl,
								color: user.color,
								_id: user._id
							}
						});
					}
				);
			} else {
				addErrorMessages(errorObject, `Email or password is incorrect`);
				return res.status(401).json(errorObject);
			}
		});
	});
});

module.exports = router;
