'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	bcrypt = require('bcrypt'),
	SALT_WORK_FACTOR = 10;

/**
 * A Validation function for local strategy properties
 */
const validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
const validateLocalStrategyPassword = function(password) {
	return (this.provider !== 'local' || (password && password.length > 7));
};

/**
 * User Schema
 */
let UserSchema = new Schema({
	firstName: {
		type: String,
		trim: true
	},
	lastName: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true,
		index: true,
        required: 'Please fill in an email address',
        unique: 'Email already in the database',
		validate: [validateLocalStrategyProperty, 'Please fill in your email'],
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	password: {
		type: String,
		default: '',
		validate: [validateLocalStrategyPassword, 'Password should be longer']
	},
	tokens: [{
		type: Schema.ObjectId,
		ref: 'Token'
	}],
	role: {
		type: String,
		enum: ['user', 'admin', 'super']
	},
    active: {
        type: Boolean,
        default: false
    },
	pki: {
		publicKey: {
			type: String
		},
		privateKey: {
			type: String
		},
		expiry: {
			type: Date
		}
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
 * Hook a pre save method to hash the password and update date fields
 */
UserSchema.pre('save', function(next) {
	let user = this;

    // get the current date
    const currentDate = new Date();

    // change the updated field to current date
    this.updated = currentDate;

    // if created doesn't exist, add to that field
    if (!this.created)
        this.created = currentDate;

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) return next(err);

		// hash the password using our new salt
		bcrypt.hash(user.password, salt, function(err, hash) {
			if (err) return next(err);

			// override the cleartext password with the hashed one
			user.password = hash;
			next();
		});
	});
});

UserSchema.methods.authenticate = function(password, callback) {
	bcrypt.compare(password, this.password, function(err, isMatch) {
		if (err) return callback(err);
		callback(null, isMatch);
	});
};

module.exports = mongoose.model('User', UserSchema);