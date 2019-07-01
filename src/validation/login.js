"use strict";

const Validator = require(`validator`);
const isEmpty = require(`is-empty`);
const { addErrorMessages, hasErrors } = require(`../utils/errorHandler`);

module.exports = (data, errorObject) => {
	// Convert empty fields to an empty string so we can use validator functions
	data.username = !isEmpty(data.username) ? data.username : ``;
	data.email = !isEmpty(data.email) ? data.email : ``;
	data.password = !isEmpty(data.password) ? data.password : ``;

	// Email checks
	if (Validator.isEmpty(data.email)) {
		addErrorMessages(errorObject, `Email field is required`);
		console.log(`Email Missing`);
	} else if (!Validator.isEmail(data.email)) {
		addErrorMessages(errorObject, `Email is invalid`);
		console.log(`Email invalid`);
	}
	// Password checks
	if (Validator.isEmpty(data.password)) {
		addErrorMessages(errorObject, `Password field is required`);
		console.log(`Paddword missing`);
	}

	console.log(`Errors: `, errorObject);

	return !hasErrors(errorObject);
};
