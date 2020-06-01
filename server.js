'use strict';

require('./config/init')();

let config = require('./config/config'),
    mongoose = require('mongoose');

mongoose.Promise = global.Promise;

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

const dbOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
};

const conn = mongoose.connection;
conn.on('connecting', function() {
    console.log('Connecting to MongoDB...');
});
conn.on('error', function(error) {
    console.error('Error in MongoDB connection: ' + error);
    mongoose.disconnect();
});
conn.on('connected', function() {
    console.log('Connected to MongoDB.');
});
conn.once('open', function() {
    console.log('Connection to MongoDB open.');
});
conn.on('reconnected', function () {
    console.log('Reconnected to MongoDB');
});
conn.on('disconnected', function() {
    console.log('Disconnected from MongoDB.');
    console.log('DB URI is: ' + config.db);
    mongoose.connect(config.db, dbOptions);
});

const db = mongoose.connect(config.db, dbOptions);

// Init the express application
const app = require('./config/express')(db);

// Start the app by listening on <port>
app.listen(config.port, config.ip);

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('API started on port ' + config.port + ' with IP ' + config.ip);