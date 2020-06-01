'use strict';

/**
 * Module dependencies.
 */
let express = require('express'),
	bodyParser = require('body-parser'),
	compress = require('compression'),
	methodOverride = require('method-override'),
	helmet = require('helmet'),
	cors = require('cors'),
	config = require('./config'),
	path = require('path'),
    acl = require('../../node_express_acl');

acl.setRoles(['user', 'admin', 'super']);

module.exports = function(db) {
		// Initialize express app
	let app = express();

	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;

	// Passing the request url to environment locals
	app.use(function(req, res, next) {
		res.locals.url = req.protocol + '://' + req.headers.host + req.url;
		next();
	});

	// Should be placed before express.static
	app.use(compress({
		filter: function(req, res) {
			return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
		},
		level: 9
	}));

	// Showing stack errors
	app.set('showStackError', true);

	// Environment dependent middleware
	if (process.env.NODE_ENV === 'development') {
	} else if (process.env.NODE_ENV === 'production') {
		app.locals.cache = 'memory';
	}

	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

    app.use(cors());

	// Use helmet to secure Express headers
	app.use(helmet());
	app.disable('x-powered-by');

    // Globbing public routing files (needs to be first)
    config.getGlobbedFiles('./app/routes/public/*.js').forEach(function(routePath) {
        require(path.resolve(routePath))(app);
    });

    // Do token authentication here
    const auth = require('../app/middleware/auth.server.middleware');
    app.use(auth);

	// Globbing secured routing files
	config.getGlobbedFiles('./app/routes/secured/*.js').forEach(function(routePath) {
		require(path.resolve(routePath))(app);
	});

	// Assume 'not found' in the error msgs is a 404.
	app.use(function(err, req, res, next) {
		// If the error object doesn't exists
		if (!err) return next();

		// Log it
		console.error(err.stack);

		// Error page
		res.status(404).json({message: 'Endpoint not found.'});
	});

	// Assume 501 since no middleware responded
	app.use(function(req, res) {
		res.status(501).send({
			message: 'The requested endpoint does not exists or is not implemented.'
		});
	});

	// Return Express server instance
	return app;
};
