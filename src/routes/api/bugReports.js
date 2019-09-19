"use strict";

const express = require(`express`);
const router = express.Router();
var passport = require(`passport`);

const controller = require(`../../controllers/bugReportController`);

router.get(`/`, passport.authenticate(`jwt`, { session: false }), controller.getAllBugReports);

router.put(`/`, passport.authenticate(`jwt`, { session: false }), controller.validate(controller.validationTypes.CREATE_BUG_REPORT), controller.createBugReport);

router.post(`/fix/:id`, passport.authenticate(`jwt`, { session: false }), controller.setFixed);
router.post(`/open/:id`, passport.authenticate(`jwt`, { session: false }), controller.setOpen);
router.post(`/reject/:id`, passport.authenticate(`jwt`, { session: false }), controller.setRejected);

module.exports = router;
