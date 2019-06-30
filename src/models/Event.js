"use strict";

const mongoose = require(`mongoose`);
require(`mongoose-type-url`);
const Schema = mongoose.Schema;

// Create Schema
const EventSchema = new Schema({
	imageUrl: {
		type: mongoose.SchemaTypes.Url,
		required: true
	},
	startDate: {
		type: Number,
		required: true
	},
	endDate: {
		type: Number,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	location: {
		address: {
			type: String,
			required: true
		},
		city: {
			type: String,
			required: true
		},
		state: {
			type: String,
			required: true
		},
		country: {
			type: String,
			required: true
		},
		zipcode: {
			type: String,
			required: true
		},
		lat: {
			type: Number,
			required: true
		},
		lon: {
			type: Number,
			required: true
		}
	},
	description: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model(`events`, EventSchema);
