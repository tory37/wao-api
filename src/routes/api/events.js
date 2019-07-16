"use strict";

const express = require(`express`);
const router = express.Router();
const moment = require(`moment`);
const usersHelper = require(`../../utils/usersHelper`);
var passport = require(`passport`);

const { sendNewEventNotifications } = require(`../../utils/emailHandler`);

// Load input validation
const isEventObjectValid = require(`../../validation/eventObject`);
// const isEventUpdateInputValid = require(`../../validation/eventUpdate`);

// Load Event model
const Event = require(`../../models/Event`);
const { addErrorMessages, createErrorObject, hasErrors } = require(`../../utils/errorHandler`);

// Load User Model
const User = require(`../../models/User`);

router.get(`/`, (req, res, next) => {
	const errorObject = createErrorObject();

	try {
		if (hasErrors(errorObject)) {
			return res.status(400).json(errorObject);
		}

		const nowTimestamp = moment().unix();

		Event.find()
			.then(events => {
				return res.status(200).json(events);
			})
			.catch(err => {
				addErrorMessages(errorObject, err);
				return res.status(500).json(errorObject);
			});
	} catch (err) {
		addErrorMessages(errorObject, err);
		return res.status(500).json(errorObject);
	}
});

router.get(`/past`, (req, res, next) => {
	const errorObject = createErrorObject();

	try {
		if (hasErrors(errorObject)) {
			return res.status(400).json(errorObject);
		}

		const nowTimestamp = moment().unix();

		Event.find({
			endTimestamp: {
				$lt: nowTimestamp
			}
		})
			.then(events => {
				return res.status(200).json(events);
			})
			.catch(err => {
				addErrorMessages(errorObject, err);
				return res.status(500).json(errorObject);
			});
	} catch (err) {
		addErrorMessages(errorObject, err);
		return res.status(500).json(errorObject);
	}
});

router.get(`/future`, (req, res, next) => {
	const errorObject = createErrorObject();

	try {
		if (hasErrors(errorObject)) {
			return res.status(400).json(errorObject);
		}

		const nowTimestamp = moment().unix();

		Event.find({
			endTimestamp: {
				$gt: nowTimestamp
			}
		})
			.then(events => {
				return res.status(200).json(events);
			})
			.catch(err => {
				addErrorMessages(errorObject, err);
				return res.status(500).json(errorObject);
			});
	} catch (err) {
		addErrorMessages(errorObject, err);
		return res.status(500).json(errorObject);
	}
});

// @route PUT
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
				.then(event => {
					const onFinish = () => {
						res.json(newEvent);
					};

					User.find({ subscriptions: `EVENTS` })
						.then(users => {
							sendNewEventNotifications(users, newEvent, res, req, onFinish);
						})
						.catch(err => {
							console.log(`Error: Did not send email notifications for new event.`, err);
							onFinish();
						});
				})
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
