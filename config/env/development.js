'use strict';

module.exports = {
    app: {
        title: 'node-restful-api-scaffold - Development Environment'
    },
    db: 'mongodb://localhost/restful-api-dev',
    jwt: {
        expirySeconds: 10000,
        tokenExpiryDays: 7,
        pkiExpiryDays: 30
    }
};
