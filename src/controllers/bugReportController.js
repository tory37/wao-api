"use strict";

// Load BugReport model
const BugReport = require(`../models/BugReport`);
const { addErrorMessages, createErrorObject } = require(`../utils/errorHandler`);

const { body, validationResult, sanitizeBody } = require(`express-validator`);

const { isAdmin } = require(`../utils/usersHelper`);

const controller = {};

controller.validationTypes = {
	CREATE_BUG_REPORT: `CREATE_BUG_REPORT`
};

controller.validate = method => {
	switch (method) {
		case controller.validationTypes.CREATE_BUG_REPORT: {
			return [body(`description`).exists(), sanitizeBody(`description`)];
		}
	}
};

controller.getAllBugReports = (req, res, next) => {
	let errorObject = createErrorObject();

	try {
		BugReport.find()
			.populate(`reporter`, `username _id email`)
			.then(bugReports => {
				res.status(200).json(bugReports);
			})
			.catch(err => {
				addErrorMessages(errorObject, err);
				res.status(500).json(errorObject);
			});
	} catch (err) {
		addErrorMessages(errorObject, err);
		res.status(500).json(errorObject);
	}
};

controller.createBugReport = (req, res, next) => {
	let errorObject = createErrorObject();

	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			addErrorMessages(errorObject, errors.array());
			return res.status(422).json(errorObject);
		}

		if (!isAdmin(req.user)) {
			addErrorMessages(errorObject, `Unathorized`);
			return res.status(401).json(errorObject);
		}

		const { description } = req.body;
		const { _id } = req.user._id;
		const newBugReport = new BugReport({
			description,
			reporter: _id
		});

		newBugReport
			.save()
			.then(bugReport => {
				res.status(200).json(`Successfully created bug report.`);
			})
			.catch(err => {
				throw err;
			});
	} catch (err) {
		return next(err);
	}
};

module.exports = controller;
