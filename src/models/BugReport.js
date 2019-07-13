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
		reporter: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: `users`
		},
		status: {
			type: String,
			enum: [`OPEN`, `FIXED`, `WONTFIX`],
			default: `OPEN`
		}
	},
	{
		timestamps: {}
	}
);

module.exports = mongoose.model(`bugReports`, BugReportSchema);
