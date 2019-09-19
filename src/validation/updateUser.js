"use strict";

const Validator = require(`validator`);
const isEmpty = require(`is-empty`);
const { addErrorMessages, hasErrors } = require(`../utils/errorHandler`);

module.exports = (data, errorObject) => {
	// Convert empty fields to an empty string so we can use validator functions
	data.email = !isEmpty(data.email) ? data.email : ``;

	if (data.email.length > 0 && !Validator.isEmail(data.email)) {
		addErrorMessages(errorObject, `Email is invalid`);
	}

	return !hasErrors(errorObject);
};
