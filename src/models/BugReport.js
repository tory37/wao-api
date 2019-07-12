"use strict";

const mongoose = require(`mongoose`);
require(`mongoose-type-url`);
const Schema = mongoose.Schema;

// Create Schema
const BugReportSchema = new Schema(
	{
		description: {
			type: String,
			required: true
		},
		reporterId: {
			type: Schema.Types.ObjectId,
			required: true
		},
		status: {
			type: [String],
			enum: [`OPEN`, `FIXED`, `REJECTED`],
			default: [`OPEN`]
		}
	},
	{
		timestamps: {}
	}
);

module.exports = mongoose.model(`bugReports`, BugReportSchema);
