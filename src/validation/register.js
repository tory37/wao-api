"use strict";

const Validator = require(`validator`);
const isEmpty = require(`is-empty`);
const { addErrorMessages, hasErrors } = require(`../utils/errorHandler`);

module.exports = (data, errorObject) => {
	// Convert empty fields to an empty string so we can use validator functions
	data.username = !isEmpty(data.username) ? data.username : ``;
	data.email = !isEmpty(data.email) ? data.email : ``;
	data.password = !isEmpty(data.password) ? data.password : ``;
	data.password2 = !isEmpty(data.password2) ? data.password2 : ``;

	// Email checks
	if (Validator.isEmpty(data.username)) {
		addErrorMessages(errorObject, `Username field is required`);
	} else if (!Validator.isAlphanumeric(data.username)) {
		addErrorMessages(errorObject, `Username is invalid: Letters and numbers only`);
	}

	// Email checks
	if (Validator.isEmpty(data.email)) {
		addErrorMessages(errorObject, `Email field is required`);
	} else if (!Validator.isEmail(data.email)) {
		addErrorMessages(errorObject, `Email is invalid`);
	}

	// Password checks
	if (Validator.isEmpty(data.password)) {
		addErrorMessages(errorObject, `Password field is required`);
	}

	if (Validator.isEmpty(data.password2)) {
		addErrorMessages(errorObject, `Confirm password field is required`);
	}

	if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
		addErrorMessages(errorObject, `Password must be at least 6 characters`);
	}
	if (!Validator.equals(data.password, data.password2)) {
		addErrorMessages(errorObject, `Passwords must match`);
	}

	return !hasErrors(errorObject);
};
