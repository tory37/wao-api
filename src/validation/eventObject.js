"use strict";

const Validator = require(`validator`);
const isEmpty = require(`is-empty`);
const { addErrorMessages, hasErrors } = require(`../utils/errorHandler`);

module.exports = (data, errorObject) => {
	// Convert empty fields to an empty string so we can use validator functions
	data.imageUrl = !isEmpty(data.imageUrl) ? data.imageUrl : ``;
	data.startTimestamp = !isEmpty(data.startTimestamp) ? data.startTimestamp : ``;
	data.endTimestamp = !isEmpty(data.endTimestamp) ? data.endTimestamp : ``;
	data.title = !isEmpty(data.title) ? data.title : ``;
	data.address = !isEmpty(data.address) ? data.address : ``;
	data.lat = !isEmpty(data.lat) ? data.lat : ``;
	data.lng = !isEmpty(data.lng) ? data.lng : ``;
	data.description = !isEmpty(data.description) ? data.description : ``;

	if (Validator.isEmpty(data.imageUrl)) {
		addErrorMessages(errorObject, `Image URL field is required`);
	}

	if (data.startTimestamp.length === 0) {
		addErrorMessages(errorObject, `Start timestamp is required`);
	} else if (typeof parseFloat(data.startTimestamp) !== `number`) {
		addErrorMessages(errorObject, `Start Timestamp is not a valid timestamp`);
	}

	if (data.endTimestamp.length === 0) {
		addErrorMessages(errorObject, `End timestamp is required`);
	} else if (typeof parseFloat(data.endTimestamp) !== `number`) {
		addErrorMessages(errorObject, `End Timestamp is not a valid timestamp`);
	}

	if (Validator.isEmpty(data.title)) {
		addErrorMessages(errorObject, `Title field is required`);
	}

	if (Validator.isEmpty(data.address)) {
		addErrorMessages(errorObject, `Address is required`);
	}

	if (data.lat.length === 0) {
		addErrorMessages(errorObject, `Lat is required`);
	} else if (typeof data.lat !== `number`) {
		addErrorMessages(errorObject, `Lat is invalid`);
	}

	if (data.lng.length === 0) {
		addErrorMessages(errorObject, `Lng is required`);
	} else if (typeof data.lng !== `number`) {
		addErrorMessages(errorObject, `Lng is invalid`);
	}

	if (Validator.isEmpty(data.description)) {
		addErrorMessages(errorObject, `Description field is required`);
	}

	return !hasErrors(errorObject);
};
