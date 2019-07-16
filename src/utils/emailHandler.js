"use strict";

const sgMail = require(`@sendgrid/mail`);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { addErrorMessages } = require(`./errorHandler`);

module.exports.sendPasswordChangeConfirmationEmail = (user, errorObject, res, req) => {
	var email = {
		from: `no-reply@weebsandotakus.com`,
		to: user.email,
		subject: `Password Change Confirmation`,
		dynamic_template_data: {
			clientBaseUrl: req.headers.origin
		},
		template_id: `d-01002ed2a24f48388197dcad4b8dc6ca`
	};

	sgMail.send(email, err => {
		if (err) {
			addErrorMessages(errorObject, `Error ocurred while sending email.  Please contact administrators.`);
			console.log(`Error: Password Change Confirmation: `, err);
			res.status(200).send(`Password successfully changed.`);
		}

		res.status(200).send(`A password reset email has been sent to ` + user.email + `. Check your spam.`);
	});
};

module.exports.sendPasswordResetEmail = (user, errorObject, res, req) => {
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
