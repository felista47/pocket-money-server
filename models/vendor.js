const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const validator = require('validator')

const vendorSchema = new mongoose.Schema({
  personalInfo: {
    id: {
      type: String,
      default:''
    },
    name: {
      type: String,
      default:''
    },
    phoneNumber: {
      type: String,
      default:''
    },
    homeAddress: {
      type: String,
      default:''
    },
  },
  shopInfo:{
    shopName:{
      type:String,
      default:''
    } ,
    school:{
      type:String,
      default:''
    } ,
    contactInfo:{
      type:String,
      default:''
    },
    shopBal:{
      type: Number,
      default: 0,
      min: 0 ,
    }

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
  servicesProvided: [
    {
      type: String,
      default:''

    }
  ],
  paymentDetails: {
    tillName: {
      type: String,
      enum: ['M-PESA', 'Other'],
      default:null
    },
    tillHolderName: {
      type: String,
      default:''

    },
    tillNumber: {
      type: String,
      default:''

    },

  },
  active: {
    type: Boolean,
    default: true
  }
});

vendorSchema.statics.signup = async function (email, password) {
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

    const vendor = await this.create({
      userAccountInfo: { email, password: hash },
    });
    return vendor;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Enhanced error handling for login method
vendorSchema.statics.login = async function (email, password) {
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

    const vendor = await this.findOne({ 'userAccountInfo.email': email });
    if (!vendor) {
      return { errors: ['Incorrect email'] }; // Return error message
    }

    const match = await bcrypt.compare(password, vendor.userAccountInfo.password);
    if (!match) {
      return { errors: ['Incorrect password'] }; // Return error message
    }

    return { success: true, vendor};
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = mongoose.model('Vendor', vendorSchema);
