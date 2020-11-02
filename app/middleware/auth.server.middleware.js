'use strict';

const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {

    const User = require('../models/user.model');

    let token = req.headers['x-access-token'];

    if (token) {

        let decodedUser = jwt.decode(token);

        if (decodedUser === null) {
            res.status(401).send({
                message: 'The supplied access token is corrupt.'
            });
            return;
        }

        let userId = decodedUser._id;

        User.findById(userId).exec(function (err, user) {
            if (!user || err) {
                res.status(401).send({
                    message: 'Database error getting the userId supplied in x-user-id.'
                });
                return;
            }

            jwt.verify(token, user.pki.publicKey, function(err, decoded) {
                if (err) {
                    res.status(401).send({
                        message: 'The supplied x-access-token (JWT) is not valid. Please login again.',
                        error: err
                    });
                } else {
                    // if everything is good, save user to request for use in other routes
                    req.user = decoded;
                    next();
                }
            });

        });
    } else {
        res.status(401).send({
            message: 'One or both of the required headers (x-user-id, x-access-token) are missing.'
        });
    }
};
