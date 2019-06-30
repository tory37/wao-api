"use strict";

const isAdmin = user => {
	return user.roles.includes(`ADMIN`);
};

module.exports = {
	isAdmin
};
