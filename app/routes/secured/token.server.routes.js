'use strict';

const acl = require('../../../../node_express_acl');

try {
    acl.addResource('/tokens',[
        {'role': 'super', 'methods': ['GET']}
    ]);
    acl.addResource('/tokens/:param',[
        {'role': 'super', 'methods': ['GET', 'DELETE']}
    ]);
} catch (err) {
    console.log('Error adding ACL resource.');
}

module.exports = function(app) {
    const token = require('../../../app/controllers/token.server.controller');
    app.route('/tokens')
        .get(acl.authorize, token.getAll);
    app.route('/tokens/:tokenId')
        .get(acl.authorize, token.getOne)
        .delete(acl.authorize, token.remove);
};
