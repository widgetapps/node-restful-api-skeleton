'use strict';

const acl = require('../lib/acl'),
    mongoose = require('mongoose'),
    _ = require('lodash');

exports.checkAcl = function (req, res, next) {
    if (req.user) {

        let ObjectId = mongoose.Types.ObjectId;

        let pathParts = req.path.split('/');
        let newPathParts = [];

        _.forEach(pathParts, function (part) {
            if (ObjectId.isValid(part)) {
                let id = new ObjectId(part);
                if (part === id.toString()) {
                    newPathParts.push(':param');
                } else {
                    newPathParts.push(part);
                }
            } else {
                newPathParts.push(part);
            }
        });

        let newPath = newPathParts.join('/');

        acl.isAllowed(
            req.user._id,
            newPath, req.method.toLowerCase(), (error, allowed) => {
                if (allowed) {
                    console.log('Authorization passed');
                    next();
                } else {
                    console.log('Authorization failed');
                    res.status(403).send({
                        message: 'Insufficient permissions to access resource.'
                    });
                }
            });
    } else {
        res.send({ message: 'User not authenticated' })
    }
};

exports.sendUnauthorized = function (res) {
    res.status(403).send({
        message: 'You are not authorized to access this resource.'
    });
};

exports.isObjectId = function (objectId) {
    let ObjectId = mongoose.Types.ObjectId;

    if (ObjectId.isValid(objectId)) {
        let id = new ObjectId(objectId);
        if (objectId === id.toString()) {
            return true;
        }
    }

    return false;

};

