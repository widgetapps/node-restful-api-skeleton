'use strict';

const User = require('../models/user.model'),
    _ = require('lodash'),
    util = require('../lib/util');

exports.getAll = function (req, res) {
    User.find({}, {firstName: 1, lastName: 1, email: 1, role: 1, active: 1, updated: 1, created: 1}).exec(function (err, users) {
        if (err) {
            res.status(500).send({
                message: 'Database error finding users.'
            });
            return;
        }
        res.json(users);

    });
};

exports.getOne = function (req, res) {

    if (!util.isObjectId(req.params.userId)) {
        res.status(400).send({
            message: 'Invalid user id.'
        });
        return;
    }

    // A user can only view their own document
    if (req.user.role === 'user' && req.user._id !== req.params.userId) {
        res.status(403).send({
            message: 'You are not authorized to view this user.'
        });
        return;
    }

    User.findById(req.params.userId, {firstName: 1, lastName: 1, email: 1, role: 1, active: 1, updated: 1, created: 1})
        .exec(function (err, user) {
            if (!user || err) {
                res.status(404).send({
                    message: 'User not found'
                });
                return;
            }

            res.json(user);
    });
};

exports.insert = function (req, res) {

    let user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        tokens: [],
        role: 'user',
        active: true
    });

    user.save(function (err, savedUser) {
        if (err) {
            res.status(500).send({
                message: 'Database error saving new user.'
            });
            return;
        }

        savedUser.password = undefined;
        savedUser.tokens = undefined;
        savedUser.pki = undefined;

        res.json(savedUser);
    });
};

exports.patch = function (req, res) {

    if (!util.isObjectId(req.params.userId)) {
        res.status(400).send({
            message: 'Invalid user id.'
        });
        return;
    }

    // A user can only patch their own document
    if (req.user.role === 'user' && req.user._id !== req.params.userId) {
        res.status(403).send({
            message: 'You are not authorized to edit this user.'
        });
        return;
    }

    User.findById(req.params.userId)
        .exec(function (err, user) {
            if (!user || err) {
                res.status(404).send({
                    message: 'User not found'
                });
                return;
            }

            let validFields = ['firstName', 'lastName', 'email'];
            let invalidField = false;

            _.forIn(req.body, function(value, key) {
                if (!_.includes(validFields, key)) {
                    res.status(400).send({
                        message: 'Trying to patch invalid field.'
                    });
                    invalidField = true;
                }
            });

            if (invalidField) return;

            user = _.assignIn(user, req.body);

            user.save(function (err, savedUser) {
                if (err) {
                    res.status(500).send({
                        message: 'Database error saving user.'
                    });
                    return;
                }

                savedUser.password = undefined;
                savedUser.tokens = undefined;
                savedUser.pki = undefined;

                res.json(savedUser);
            });
        });
};

exports.remove = function (req, res) {

    if (!util.isObjectId(req.params.userId)) {
        res.status(400).send({
            message: 'Invalid user id.'
        });
        return;
    }

    if (req.user._id === req.params.userId) {
        res.status(400).send({
            message: 'You cannot delete yourself!'
        });
        return;
    }

    User.findById(req.params.userId)
        .exec(function (err, user) {
            if (!user || err) {
                res.status(404).send({
                    message: 'User not found'
                });
                return;
            }

            user.remove(function (err, removedUser) {
                if (err) {
                    res.status(500).send({
                        message: 'Database error deleting user.'
                    });
                    return;
                }

                res.json({
                    message: 'The user has been removed.'
                });
            });
        });
};