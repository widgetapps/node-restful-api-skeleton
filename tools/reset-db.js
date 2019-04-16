'use strict';

require('../config/init')();

let config = require('../config/config');

const mongoose = require('mongoose'),
    User = require('../app/models/user.model'),
    Token = require('../app/models/token.model');

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
conn.on('connected', function() {
    console.log('Connected to MongoDB.');
});

mongoose.connect(config.db, dbOptions);

User.deleteMany({}, function (err) {
    Token.deleteMany({}, function (err) {
        let user = new User({
            firstName: 'Super',
            lastName: 'Admin',
            email: 'admin@example.com',
            password: '12345678',
            role: 'super'
        });

        user.save(function (err, savedUser) {
            console.log('Database has been cleared. Default user has been added.');
        });
    });
});