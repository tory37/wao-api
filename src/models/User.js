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
			required: true,
			unique: true
		},
		roles: {
			type: [String],
			enum: [`ADMIN`, `NORMIE`],
			default: [`NORMIE`]
		},
		email: {
			type: String,
			required: true,
			unique: true
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
			default: `#282929`
		},
		isVerified: {
			type: Boolean,
			default: false
		},
		verificationToken: {
			type: String
		},
		subscriptions: {
			type: [String],
			enum: [`EVENTS`],
			default: [`EVENTS`]
		}
	},
	{
		timestamps: {}
	}
);

module.exports = mongoose.model(`users`, UserSchema);
