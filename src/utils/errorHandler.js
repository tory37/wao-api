"use strict";

const _ = require(`lodash`);

const createErrorObject = errorMessages => {
	let errorObject = {};
	errorObject.messages = [];
	addErrorMessages(errorObject, errorMessages);

	return errorObject;
};

const addErrorMessages = (errorObject, errorMessages) => {
	if (errorMessages) {
		if (_.isArray(errorMessages)) {
			_.forEach(errorMessages, errorMessage => {
				if (_.isString(errorMessage)) {
					errorObject.messages.push(errorMessage);
				} else {
					console.log(`Message is not a string: `, errorMessage);
				}
			});
		} else if (_.isString(errorMessages)) {
			errorObject.messages.push(errorMessages);
		} else {
			console.log(`Message is not a string: `, errorMessages);
		}
	}
};

const hasErrors = errorObject => {
	return errorObject.messages.length > 0;
};

module.exports = {
	createErrorObject,
	addErrorMessages,
	hasErrors
};
