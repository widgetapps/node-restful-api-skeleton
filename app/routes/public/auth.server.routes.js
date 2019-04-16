'use strict';

module.exports = function(app) {
    const auth = require('../../../app/controllers/auth.server.controller');
    app.route('/auth/login').post(auth.login);
    app.route('/auth/token/:token').post(auth.token);
};
