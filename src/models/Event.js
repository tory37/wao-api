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
		lat: {
			type: Number,
			required: true
		},
		lng: {
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
