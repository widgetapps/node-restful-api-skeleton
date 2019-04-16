'use strict';

const Token = require('../models/token.model'),
    _ = require('lodash'),
    util = require('../lib/util');

exports.getAll = function (req, res) {
    Token.find({}).exec(function (err, tokens) {
        if (err) {
            res.status(500).send({
                message: 'Database error getting tokens.'
            });
            return;
        }

        res.json(tokens);
    });
};

exports.getOne = function (req, res) {

    if (!util.isObjectId(req.params.tokenId)) {
        res.status(400).send({
            message: 'Invalid token id.'
        });
        return;
    }

    Token.findById(req.params.tokenId).exec(function (err, token) {
        if (err) {
            res.status(500).send({
                message: 'Database error getting token.'
            });
            return;
        }

        res.json(token);
    });
};

exports.remove = function (req, res) {

    if (!util.isObjectId(req.params.tokenId)) {
        res.status(400).send({
            message: 'Invalid token id.'
        });
        return;
    }

    Token.findById(req.params.tokenId)
        .exec(function (err, token) {
            if (!token || err) {
                res.status(404).send({
                    message: 'Token not found'
                });
                return;
            }

            token.remove(function (err, removedToken) {
                if (err) {
                    res.status(500).send({
                        message: 'Database error deleting token.'
                    });
                    return;
                }

                res.json({
                    message: 'The token has been removed.'
                });
            });
        });
};