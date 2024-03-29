const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const parentSchema = new mongoose.Schema({
  personalInfo: {
    id: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    homeAddress: {
      type: String,
      default: '',
    },
  },
  parentalDetails: {
    parentRelationship: {
      type: String,
      enum: ['Father', 'Mother', 'Guardian'],
      default: null,
    },
  },
  userAccountInfo: {
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email is unique
      validate: [validator.isEmail, 'Invalid email format'], // Validate email format
    },
    password: {
      type: String,
      required: true,
      validate: [ // Validate password strength
        {
          validator: value => validator.isStrongPassword(value),
          message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
      ],
    },
  },
});

// Improved error handling for signup method
parentSchema.statics.signup = async function (email, password) {
  try {
    // Validation
    const errors = [];
    if (!email) {
      errors.push('Email must be filled');
    }
    if (!password) {
      errors.push('Password must be filled');
    }
    const exists = await this.findOne({ 'userAccountInfo.email': email });
    if (exists) {
      errors.push('User with this email already exists');
    }

    if (errors.length > 0) {
      return { errors }; // Return errors array
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const parent = await this.create({
      userAccountInfo: { email, password: hash },
    });
    return { parent }; // Return parent object
  } catch (error) {
    throw new Error(error.message);
  }
};

// Enhanced error handling for login method
parentSchema.statics.login = async function (email, password) {
  try {
    // Validation
    const errors = [];
    if (!email) {
      errors.push('Email must be filled');
    }
    if (!password) {
      errors.push('Password must be filled');
    }

    if (errors.length > 0) {
      return { errors }; // Return errors array
    }

    const parent = await this.findOne({ 'userAccountInfo.email': email });
    if (!parent) {
      return { errors: ['Incorrect email'] }; // Return error message
    }

    const match = await bcrypt.compare(password, parent.userAccountInfo.password);
    if (!match) {
      return { errors: ['Incorrect password'] }; // Return error message
    }

    return { success: true, parent }; // Return success and parent object
  } catch (error) {
    throw new Error(error.message);
  }
};


module.exports = mongoose.model('Parent', parentSchema);
