'use strict';

const version = require('../../package.json').version;

module.exports = {
	app: {
		title: 'node-restful-api-scaffold',
		description: 'The basics to get a RESTful API working.',
		keywords: 'MongoDB, Express, Node.js'
	},
	dbOptions: {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false
	},
	jwt: {
		expirySeconds: 900,
		tokenExpiryDays: 7,
		pkiExpiryDays: 30
	},
	version: version,
	port: process.env.PORT || 3101,
	ip: process.env.IP || '127.0.0.1'
};