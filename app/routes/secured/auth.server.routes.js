'use strict';

const acl = require('../../../../node_express_acl');

try {
    acl.addResource('/auth/validate',[
        {'role': 'super', 'methods': ['GET']},
        {'role': 'admin', 'methods': ['GET']},
        {'role': 'user', 'methods': ['GET']}
    ]);
} catch (err) {
    console.log('Error adding ACL resource.');
}

module.exports = function(app) {
    const auth = require('../../../app/controllers/auth.server.controller');
    app.route('/auth/validate').get(acl.authorize, auth.validate);
};
