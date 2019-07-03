"use strict";

const express = require(`express`);
const router = express.Router();
const moment = require(`moment`);
const usersHelper = require(`../../utils/usersHelper`);
var passport = require(`passport`);

// Load input validation
const isEventObjectValid = require(`../../validation/eventObject`);
// const isEventUpdateInputValid = require(`../../validation/eventUpdate`);

// Load Event model
const Event = require(`../../models/Event`);
const { addErrorMessages, createErrorObject, hasErrors } = require(`../../utils/errorHandler`);

router.get(`/`, (req, res, next) => {
	const errorObject = createErrorObject();

	if (hasErrors(errorObject)) {
		return res.status(400).json(errorObject);
	}

	const nowTimestamp = moment().unix();

	if (req.query.getPast) {
		Event.find({
			endTimestamp: {
				$lt: nowTimestamp
			}
		}).then(events => {
			return res.status(200).json(events);
		});
	} else {
		Event.find({
			endTimestamp: {
				$gt: nowTimestamp
			}
		}).then(events => {
			return res.status(200).json(events);
		});
	}
});

// @route PUT api/users/register
// @desc
// @access Private
router.put(`/`, passport.authenticate(`jwt`, { session: false }), (req, res, next) => {
	let errorObject = createErrorObject();

	try {
		// Form validation
		const isValid = isEventObjectValid(req.body, errorObject);

		// Check validation
		if (!isValid) {
			return res.status(400).json(errorObject);
		}

		if (usersHelper.isAdmin(req.user)) {
			const newEvent = new Event({
				imageUrl: req.body.imageUrl,
				startTimestamp: req.body.startTimestamp,
				endTimestamp: req.body.endTimestamp,
				title: req.body.title,
				address: req.body.address,
				lat: req.body.lat,
				lng: req.body.lng,
				description: req.body.description
			});

			newEvent
				.save()
				.then(user => res.json(newEvent))
				.catch(err => {
					addErrorMessages(errorObject, err.message);
					return res.status(400).json(errorObject);
				});
		} else {
			addErrorMessages(errorObject, `Unauthorized`);
			return res.status(400).json(errorObject);
		}
	} catch (err) {
		console.log(err);
		addErrorMessages(errorObject, err.message);
		return res.status(400).json(errorObject);
	}
});

router.put(`/:id`, passport.authenticate(`jwt`, { session: false }), (req, res, next) => {
	let errorObject = createErrorObject();

	try {
		// Form validation
		const isValid = isEventObjectValid(req.body, errorObject);

		// Check validation
		if (!isValid) {
			return res.status(400).json(errorObject);
		}

		if (usersHelper.isAdmin(req.user)) {
			const filter = {
				_id: req.params.id
			};

			const update = {
				imageUrl: req.body.imageUrl,
				startTimestamp: req.body.startTimestamp,
				endTimestamp: req.body.endTimestamp,
				title: req.body.title,
				address: req.body.address,
				lat: req.body.lat,
				lng: req.body.lng,
				description: req.body.description
			};

			Event.findOneAndUpdate(filter, update, { new: true })
				.then(updatedEvent => res.json(updatedEvent))
				.catch(err => {
					addErrorMessages(errorObject, err.message);
					return res.status(400).json(errorObject);
				});
		} else {
			addErrorMessages(errorObject, `Unauthorized`);
			return res.status(400).json(errorObject);
		}
	} catch (err) {
		console.log(err);
		addErrorMessages(errorObject, err.message);
		return res.status(400).json(errorObject);
	}
});

module.exports = router;
