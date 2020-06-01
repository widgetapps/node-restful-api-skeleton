'use strict';

const mongoose = require('mongoose');

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

