'use strict';

const util = require('../../lib/util');

module.exports = function(app) {
    const token = require('../../../app/controllers/token.server.controller');
    app.route('/tokens')
        .get(util.checkAcl, token.getAll);
    app.route('/tokens/:tokenId')
        .get(util.checkAcl, token.getOne)
        .delete(util.checkAcl, token.remove);
};
