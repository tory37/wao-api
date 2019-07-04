"use strict";

const mongoose = require(`mongoose`);
require(`mongoose-type-url`);
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema(
	{
		username: {
			type: String,
			required: true
		},
		roles: {
			type: [String],
			enum: [`ADMIN`, `NORMIE`],
			default: [`NORMIE`]
		},
		email: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		imageUrl: {
			type: String
		}
	},
	{
		timestamps: {}
	}
);

module.exports = mongoose.model(`users`, UserSchema);
