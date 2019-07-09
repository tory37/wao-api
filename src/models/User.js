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
		username_lower: {
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
		},
		color: {
			type: String,
			required: true,
			default: `black`
		},
		isVerified: {
			type: Boolean,
			default: false
		},
		verificationToken: {
			type: String
		}
	},
	{
		timestamps: {}
	}
);

module.exports = mongoose.model(`users`, UserSchema);
