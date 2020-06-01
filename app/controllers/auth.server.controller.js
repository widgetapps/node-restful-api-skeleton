'use strict';

const mongoose = require('mongoose'),
    jwt = require('jsonwebtoken') ,
    randtoken = require('rand-token'),
    moment = require('moment'),
    User = require('../models/user.model'),
    Token = require('../models/token.model'),
    crypto = require('crypto');

const JWT_EXPIRY = 10000,
    TOKEN_EXPIRY_DAYS = 7,
    PKI_EXPIRY_DAYS = 30;

exports.login = function (req, res) {

    // Find the user
    User.findOne( {email: req.body.email} ).exec(function (err, user) {
        if (err) {
            res.status(500).send({
                message: 'Database error finding the user.'
            });
            return;
        }
        if (!user) {
            res.status(404).send({
                message: 'User not found.'
            });
            return;
        }

        console.log('User found...');

        // Authenticate the password
        user.authenticate(req.body.password, function (err, match) {
            if (!match || err) {
                res.status(401).send({
                    message: 'Authentication failed.'
                });
                return;
            }

            console.log('Authentication is successful...');

            // Check to see if the key pair has expired
            let pkiExpired = false;
            if (user.pki && user.pki.expiry) {
                let pkiExpiry = moment(new Date(user.pki.expiry));
                if (moment(new Date()).isAfter(pkiExpiry)) {
                    console.log('PKI expired...');
                    pkiExpired = true;
                }
            } else {
                console.log('No PKI expiry found...');
                pkiExpired = true;
            }

            // Create the new refresh token, expires in 7 days
            let token = new Token({
                token: randtoken.uid(256),
                expiry: moment(new Date()).add(TOKEN_EXPIRY_DAYS, 'days').format(),
                user: mongoose.Types.ObjectId(user._id)
            });

            token.save(function (err, savedToken) {
                if (err) {
                    res.status(500).send({
                        message: 'Database error saving token.'
                    });
                    return;
                }

                console.log('New token saved...');

                // Generate the new key pair, just in case
                crypto.generateKeyPair('rsa', {
                    modulusLength: 2048,
                    publicKeyEncoding: {
                        type: 'spki',
                        format: 'pem'
                    },
                    privateKeyEncoding: {
                        type: 'pkcs8',
                        format: 'pem'
                    }
                }, function (err, newPublicKey, newPrivateKey) {
                    if (err) {
                        res.status(500).send({
                            message: 'Error creating new key pair.'
                        });
                        return;
                    }

                    console.log('Key pair created...');

                    // If the key pair is expired, then assign the new pair to the user, expiry is 30 days
                    if (pkiExpired) {
                        console.log('New PKI data is being used...');
                        user.pki.privateKey = newPrivateKey;
                        user.pki.publicKey = newPublicKey;
                        user.pki.expiry = moment(new Date()).add(PKI_EXPIRY_DAYS, 'days').format();
                    }

                    // Add the new refresh token to the user tokens
                    user.tokens.push(mongoose.Types.ObjectId(savedToken._id));

                    // Save the changes to the user
                    user.save(function (err, savedUser) {
                        if (err) {
                            res.status(500).send({
                                message: 'Database error saving user.'
                            });
                            return;
                        }

                        console.log('User saved...');

                        // Store the keys in a var for later
                        let privateKey = savedUser.pki.privateKey;
                        let publicKey = savedUser.pki.publicKey;

                        // Clear out fields we don't want to pass to the token
                        savedUser.password = undefined;
                        savedUser.tokens = undefined;
                        savedUser.salt = undefined;
                        savedUser.active = undefined;
                        savedUser.pki = undefined;
                        savedUser.created = undefined;
                        savedUser.updated = undefined;
                        savedUser.__v = undefined;

                        // Create the JWT, expire in 15 minutes
                        let token = jwt.sign(savedUser.toObject(), privateKey, {
                            algorithm: 'RS256',
                            expiresIn: JWT_EXPIRY
                        });

                        Token.deleteMany({
                            user: mongoose.Types.ObjectId(savedUser._id),
                            expiry: {'$lte': new Date()}
                            }, function (err, result){
                            if (err) {
                                res.status(500).send({
                                    message: 'Database error deleting expired tokens.'
                                });
                                return;
                            }

                            console.log(result.n + ' expired tokens deleted...');

                            console.log('Responded to request.');
                            // return the information, including token & public key, as JSON
                            res.json({
                                message: 'Login successful.',
                                jwt: token,
                                publicKey: publicKey,
                                refreshToken: savedToken.token
                            });
                        });

                    });
                });

            });

        });
    });

};

exports.token = function (req, res) {

    Token.findOne({token: req.params.token, user: mongoose.Types.ObjectId(req.body.userId)}).exec(function (err, token) {
        if (err) {
            res.status(500).send({
                message: 'Database error finding the token.'
            });
            return;
        }
        if (!token) {
            res.status(404).send({
                message: 'Token not found.'
            });
            return;
        }

        let tokenExpired = false;
        if (token.expiry) {
            let tokenExpiry = moment(new Date(token.expiry));
            if (moment(new Date()).isAfter(tokenExpiry)) {
                console.log('Token expired...');
                tokenExpired = true;
            }
        } else {
            tokenExpired = true;
        }

        if (tokenExpired) {
            res.status(401).send({
                message: 'The refresh token has expired. You must reauthenticate.'
            });
            return;
        }

        User.findById(token.user).exec(function (err, user) {
            if (!user || err) {
                res.status(500).send({
                    message: 'Database error finding the user of the token.'
                });
                return;
            }

            // Store the keys in a var for later
            let privateKey = user.pki.privateKey;
            let publicKey = user.pki.publicKey;

            // Clear out fields we don't want to pass to the token
            user.password = undefined;
            user.tokens = undefined;
            user.salt = undefined;
            user.active = undefined;
            user.pki = undefined;
            user.created = undefined;
            user.updated = undefined;
            user.__v = undefined;

            // Create the JWT, expire in 15 minutes
            let token = jwt.sign(user.toObject(), privateKey, {
                algorithm: 'RS256',
                expiresIn: JWT_EXPIRY
            });

            res.json({
                message: 'JWT has been refreshed..',
                token: token,
                publicKey: publicKey
            });

        });

    });

};

exports.validate = function (req, res) {
    res.json({message: 'The request is valid.'});
};

