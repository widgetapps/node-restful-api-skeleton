'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let TokenSchema = new Schema({
    token: {
        type: String,
        index: true,
        unique: true,
        required: true
    },
    expiry: {
        type: Date,
        required: true
    },
    source: {},
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        index: true,
        required: true
    },
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    }
});

/**
 * Hook a pre save method to update date fields
 */
TokenSchema.pre('save', function(next) {
    // get the current date
    const currentDate = new Date();

    // change the updated field to current date
    this.updated = currentDate;

    // if created doesn't exist, add to that field
    if (!this.created)
        this.created = currentDate;

    next();
});

module.exports = mongoose.model('Token', TokenSchema);