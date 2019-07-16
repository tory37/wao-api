"use strict";

const sgMail = require(`@sendgrid/mail`);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const _ = require(`lodash`);
const moment = require(`moment`);

const { addErrorMessages } = require(`./errorHandler`);

module.exports.sendPasswordResetEmail = (user, errorObject, res, req) => {
	var email = {
		from: `no-reply@weebsandotakus.com`,
		to: user.email,
		subject: `Password Reset`,
		dynamic_template_data: {
			clientBaseUrl: req.headers.origin`/password-change/` + user.verificationToken,
			token: user.verificationToken
		},
		template_id: `d-09cfb3e41367425f90e4ec8fcba888a4`
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

module.exports.sendVerificationEmail = (user, errorObject, res, req) => {
	if (user.isVerified) {
		res.status(200).send(`A verification email has been sent to ` + user.email + `. Check your spam.`);
	}

	var email = {
		from: `no-reply@weebsandotakus.com`,
		to: user.email,
		subject: `Account Verification`,
		dynamic_template_data: {
			username: user.username,
			userEmail: user.email,
			verificationToken: user.verificationToken,
			clientBaseUrl: req.headers.origin
		},
		template_id: `d-57c97822a50e490292833c1b609a2bc7`
		// text: `Hello,\n\n` + `Please verify your account by clicking the link: \nhttp://` + req.headers.origin + `/confirmation/` + token + `.\n`
	};

	// Send the email
	sgMail.send(email, err => {
		if (err) {
			addErrorMessages(errorObject, `Error ocurred while sending email.  Please contact administrators.`);
			console.log(`Error: Registration Email: `, err);
			res.status(200).send(`Successfully registered.  Please `);
		}

		res.status(200).send(`A verification email has been sent to ` + user.email + `. Check your spam.`);
	});
};

module.exports.sendEmailChangeConfirmation = (oldEmail, newEmail, res, req, onFinish) => {
	var email = {
		from: `no-reply@weebsandotakus.com`,
		to: oldEmail,
		subject: `Change of Email`,
		dynamic_template_data: {
			newEmail: newEmail,
			clientBaseUrl: req.headers.origin
		},
		template_id: `d-4d1efe48ea894ca1be031d21ca9df2fa`
		// text: `Hello,\n\n` + `Please verify your account by clicking the link: \nhttp://` + req.headers.origin + `/confirmation/` + token + `.\n`
	};

	// Send the email
	sgMail.send(email, err => {
		if (err) {
			console.log(`Error: Email Change Confirmation: `, err);
		}

		onFinish();
	});
};

module.exports.sendPasswordChangeConfirmation = (user, res, req, onFinish) => {
	var email = {
		from: `no-reply@weebsandotakus.com`,
		to: user.email,
		subject: `Change of Email`,
		dynamic_template_data: {
			clientBaseUrl: req.headers.origin
		},
		template_id: `d-01002ed2a24f48388197dcad4b8dc6ca`
		// text: `Hello,\n\n` + `Please verify your account by clicking the link: \nhttp://` + req.headers.origin + `/confirmation/` + token + `.\n`
	};

	// Send the email
	sgMail.send(email, err => {
		if (err) {
			console.log(`Error: Password Change Confirmation: `, err);
		}

		onFinish();
	});
};

module.exports.sendNewEventNotifications = (users, event, res, req, onFinish) => {
	var userArray = _.map(users, user => {
		return {
			name: user.username,
			email: user.email
		};
	});

	const getDateDisplay = () => {
		let startMoment = moment.unix(event.startTimestamp);
		let endMoment = moment.unix(event.endTimestamp);

		let differentYears = startMoment.year() !== endMoment.year();

		let display = startMoment.format(`dddd, MMMM D, ` + (differentYears ? `YYYY` : ``) + ` [at] h:mm A`) + ` - `;

		if (startMoment.isSame(endMoment, `day`)) {
			display += endMoment.format(`h:mm A`);
		} else {
			display += endMoment.format(`dddd, MMMM D YYYY [at] h:mm A`);
		}

		return display;
	};

	var email = {
		from: `no-reply@weebsandotakus.com`,
		to: userArray,
		subject: `Change of Email`,
		dynamic_template_data: {
			clientBaseUrl: req.headers.origin,
			event: {
				title: event.title,
				date: getDateDisplay(),
				address: event.address,
				lat: event.lat,
				lng: event.lng,
				description: event.description
			}
		},
		template_id: `d-9b18e474b29c4a73822bc7fa3ce07521`
		// text: `Hello,\n\n` + `Please verify your account by clicking the link: \nhttp://` + req.headers.origin + `/confirmation/` + token + `.\n`
	};

	// Send the email
	sgMail.send(email, err => {
		if (err) {
			console.log(`Error: Password Change Confirmation: `, err);
		}

		onFinish();
	});
};
