"use strict";

const express = require(`express`);
const router = express.Router();
const bcrypt = require(`bcryptjs`);
const jwt = require(`jsonwebtoken`);
const keys = require(`../../../config/keys`);
const moment = require(`moment`);
const usersHelper = require(`../../utils/usersHelper`);
var passport = require(`passport`);

// Load input validation
const isEventCreateInputValid = require(`../../validation/eventCreate`);
const isEventUpdateInputValid = require(`../../validation/eventUpdate`);

// Load Event model
const Event = require(`../../models/Event`);
const { addErrorMessages, createErrorObject, hasErrors } = require(`../../utils/errorHandler`);

router.get(`/`, (req, res, next) => {
	const errorObject = createErrorObject();

	if (hasErrors(errorObject)) {
		return res.status(400).json(errorObject);
	}

	Event.find({}).then(events => {
		return res.status(200).json(events);
	});
});

// @route PUT api/users/register
// @desc
// @access Private
router.put(`/`, passport.authenticate(`jwt`, { session: false }), (req, res, next) => {
	let errorObject = createErrorObject();
	console.log(req.body);

	try {
		// Form validation
		const isValid = isEventCreateInputValid(req.body, errorObject);

		// Check validation
		if (!isValid) {
			return res.status(400).json(errorObject);
		}

		if (usersHelper.isAdmin(req.user)) {
			const newEvent = new Event({
				imageUrl: req.body.imageUrl,
				startDate: moment.unix(req.body.startTimestamp).toDate(),
				endDate: moment.unix(req.body.endTimestamp).toDate(),
				title: req.body.title,
				location: req.body.location,
				description: req.body.description
			});

			newEvent
				.save()
				.then(user => res.json(newEvent))
				.catch(err => console.log(err));
		} else {
			addErrorMessages(errorObject, `Unauthorized`);
			return res.status(400).json(errorObject);
		}
	} catch (err) {
		addErrorMessages(errorObject, err);
		next(errorObject);
	}
});

module.exports = router;
