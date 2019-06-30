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

	if (!isEmpty(data.location)) {
		data.location.address = !isEmpty(data.location.address) ? data.location.address : ``;
		data.location.city = !isEmpty(data.location.city) ? data.location.city : ``;
		data.location.state = !isEmpty(data.location.state) ? data.location.state : ``;
		data.location.country = !isEmpty(data.location.country) ? data.location.country : ``;
		data.location.zipcode = !isEmpty(data.location.zipcode) ? data.location.zipcode : ``;
		data.location.lat = !isEmpty(data.location.lat) ? data.location.lat : ``;
		data.location.lon = !isEmpty(data.location.lon) ? data.location.lon : ``;
	} else {
		data.location = ``;
	}

	data.description = !isEmpty(data.description) ? data.description : ``;

	if (Validator.isEmpty(data.imageUrl)) {
		addErrorMessages(errorObject, `Image Url field is required`);
	}

	if (Validator.isEmpty(data.startTimestamp)) {
		addErrorMessages(errorObject, `Start timestamp is required`);
	}

	if (Validator.isEmpty(data.endTimestamp)) {
		addErrorMessages(errorObject, `End timestamp is required`);
	}

	if (Validator.isEmpty(data.title)) {
		addErrorMessages(errorObject, `Title field is required`);
	}

	if (Validator.isEmpty(data.location)) {
		addErrorMessages(errorObject, `Location field is required`);
	} else {
		if (Validator.isEmpty(data.location.address)) {
			addErrorMessages(errorObject, `Address is required`);
		}

		if (Validator.isEmpty(data.location.city)) {
			addErrorMessages(errorObject, `City is required`);
		}

		if (Validator.isEmpty(data.location.state)) {
			addErrorMessages(errorObject, `State is required`);
		}

		if (Validator.isEmpty(data.location.country)) {
			addErrorMessages(errorObject, `Country is required`);
		}

		if (Validator.isEmpty(data.location.zipcode)) {
			addErrorMessages(errorObject, `Zipcode is required`);
		}

		if (Validator.isEmpty(data.location.lat)) {
			addErrorMessages(errorObject, `Lat is required`);
		}

		if (Validator.isEmpty(data.location.lon)) {
			addErrorMessages(errorObject, `lon is required`);
		}
	}

	if (Validator.isEmpty(data.description)) {
		addErrorMessages(errorObject, `Description field is required`);
	}

	return !hasErrors(errorObject);
};
