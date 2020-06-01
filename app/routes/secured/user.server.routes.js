'use strict';

const acl = require('../../../../node_express_acl');

try {
    acl.addResource('/users',[
        {'role': 'super', 'methods': ['GET', 'POST']}
    ]);
    acl.addResource('/users/:param',[
        {'role': 'super', 'methods': ['GET', 'PATCH', 'DELETE']},
        {'role': 'admin', 'methods': ['GET', 'PATCH']},
        {'role': 'user', 'methods': ['GET', 'PATCH']}
    ]);
} catch (err) {
    console.log('Error adding ACL resource: ' + err);
}

module.exports = function(app) {
    const user = require('../../../app/controllers/user.server.controller');
    app.route('/users')
        .get(acl.authorize, user.getAll)
        .post(acl.authorize, user.insert);
    app.route('/users/:userId')
        .get(acl.authorize, user.getOne)
        .patch(acl.authorize, user.patch)
        .delete(acl.authorize, user.remove);
};
