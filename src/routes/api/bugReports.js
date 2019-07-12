"use strict";

const express = require(`express`);
const router = express.Router();
var passport = require(`passport`);

const controller = require(`../../controllers/bugReportController`);

router.get(`/`, passport.authenticate(`jwt`, { session: false }), controller.getAllBugReports);
router.put(`/`, passport.authenticate(`jwt`, { session: false }), controller.validate(controller.validationTypes.CREATE_BUG_REPORT), controller.createBugReport);

module.exports = router;
