"use strict";

require(`dotenv`).config();
const express = require(`express`);
const morgan = require(`morgan`);
const mongoose = require(`mongoose`);
const bodyParser = require(`body-parser`);
const passport = require(`passport`);
const cors = require(`cors`);

const users = require(`./src/routes/api/users`);
const events = require(`./src/routes/api/events`);

const app = express();

// Morgan, log every request
app.use(morgan(`combined`));

app.use(cors());

// Bodyparser middleware
app.use(
	bodyParser.urlencoded({
		extended: false
	})
);
app.use(bodyParser.json());
// DB Config
const db = process.env.MONGO_URI;
// Connect to MongoDB
mongoose
	.connect(db, { useNewUrlParser: true })
	.then(() => console.log(`MongoDB successfully connected`))
	.catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());
// Passport config
require(`./config/passport`)(passport);
// Routes
app.get(`/`, function(req, res) {
	res.send(JSON.stringify({ Hello: `World` }));
});
app.use(`/api/users`, users);
app.use(`/api/events`, events);

const port = process.env.PORT || 5000; // process.env.port is Heroku's port if you choose to deploy the app there

app.listen(port, () => console.log(`Server up and running on port ${port} !`));
