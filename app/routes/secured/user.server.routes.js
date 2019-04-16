'use strict';

const util = require('../../lib/util');

module.exports = function(app) {
    const user = require('../../../app/controllers/user.server.controller');
    app.route('/users')
        .get(util.checkAcl, user.getAll)
        .post(util.checkAcl, user.insert);
    app.route('/users/:userId')
        .get(util.checkAcl, user.getOne)
        .patch(util.checkAcl, user.patch)
        .delete(util.checkAcl, user.remove);
};
