'use strict';

const util = require('../../lib/util');

module.exports = function(app) {
    const auth = require('../../../app/controllers/auth.server.controller');
    app.route('/auth/validate').get(util.checkAcl, auth.validate);
};
