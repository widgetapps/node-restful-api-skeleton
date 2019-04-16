'use strict';

const User = require('../models/user.model');
let Acl = require('acl');
let acl = new Acl(new Acl.memoryBackend());

acl.allow([
    {
        roles: ['user'],
        allows: [
            {
                resources: ['/auth/validate'],
                permissions: ['get']
            }, {
                resources: ['/users/:param'],
                permissions: ['get', 'patch']
            }, {
                resources: ['/users'],
                permissions: ['post']
            }
        ]
    }, {
        roles: ['super'],
        allows: [
            {
                resources: ['/users', '/tokens'],
                permissions: ['get']
            }, {
                resources: ['/users/:param'],
                permissions: ['delete']
            }, {
                resources: ['/tokens/:param'],
                permissions: ['get', 'delete']
            }
        ]
    }
]).then(err => {

    acl.addRoleParents('admin', 'user');
    acl.addRoleParents('super', 'admin');

    User.find({})
        .exec()
        .then(users => {
            users.forEach(user => {
                acl.addUserRoles(user._id.toString(), user.role, err => {
                    if (err) {
                        console.log(err);
                    }
                    console.log('Added', user.role, 'role to user', user.firstName, 'with id', user._id);
                });
            });
        });
});

module.exports = acl;
