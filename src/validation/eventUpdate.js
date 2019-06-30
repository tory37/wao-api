"use strict";

const Validator = require(`validator`);
const isEmpty = require(`is-empty`);
const { addErrorMessages, hasErrors } = require(`../utils/errorHandler`);

module.exports = (data, errorObject) => {
    // Convert empty fields to an empty string so we can use validator functions
    data.id = !isEmpty(data.id) ? data.id : ``;
	data.imageUrl = !isEmpty(data.imageUrl) ? data.imageUrl : ``;
	data.date = !isEmpty(data.date) ? data.date : ``;
	data.time = !isEmpty(data.time) ? data.time : ``;
	data.title = !isEmpty(data.title) ? data.title : ``;
	data.location = !isEmpty(data.location) ? data.location : ``;
	data.description = !isEmpty(data.description) ? data.description : ``;

    if (Validator.isEmpty(data.id)) {
        addErrorMessages(errorObject, `Event ID is required to update event`);
    }

	if (Validator.isEmpty(data.imageUrl)) {
		addErrorMessages(errorObject, `Image Url field is required`);
	}

	if (Validator.isEmpty(data.date)) {
		addErrorMessages(errorObject, `Date field is required`);
	}

	if (Validator.isEmpty(data.time)) {
		addErrorMessages(errorObject, `Time field is required`);
	}

	if (Validator.isEmpty(data.title)) {
		addErrorMessages(errorObject, `Title field is required`);
	}

	if (Validator.isEmpty(data.location)) {
		addErrorMessages(errorObject, `Location field is required`);
	}

	if (Validator.isEmpty(data.description)) {
		addErrorMessages(errorObject, `Description field is required`);
	}

	return !hasErrors(errorObject);
};
