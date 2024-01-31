const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const validator = require('validator')

const vendorSchema = new mongoose.Schema({
  personalInfo: {
    id: {
      type: String,
    },
    name: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,    
    },
    homeAddress: {
      type: String,
      required: false,
    },
    
  },
  userAccountInfo:{
    email: {
      type: String,
      required:true
    }  ,
    password: {
      type: String,
      required:true
    }
   },
  servicesProvided: [
    {
      type: String
      
    }
  ],
  paymentDetails: {
    tillName: {
      type: String,
      enum: ['M-PESA', 'Other']
      
    },
    tillHolderName: {
      type: String
      
    },
    tillNumber: {
      type: String
      
    },

  },
  additionalNotes: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  }
});
vendorSchema.statics.signup = async function(email, password) {

  // validation
  if (!email || !password) {
    throw Error('All fields must be filled')
  }
  if (!validator.isEmail(email)) {
    throw Error('Email not valid')
  }
  if (!validator.isStrongPassword(password)) {
    throw Error('Password not strong enough')
  }

  const exists = await this.findOne({ email })

  if (exists) {
    throw Error('User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

    const vendor = await this.create({
      userAccountInfo: { email, password: hash }})
  return vendor
}

// static login method
vendorSchema.statics.login = async function(email, password) {
  try {
    if (!email || !password) {
      throw new Error('All fields must be filled');
    }

    const vendor = await this.findOne({ 'userAccountInfo.email': email });
    if (!vendor) {
      throw new Error('Incorrect email or password');
    }

    const match = await bcrypt.compare(password, vendor.userAccountInfo.password);
    if (!match) {
      throw new Error('Incorrect email or password');
    }

    return { success: true, vendor };
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error',error);
  }
};

module.exports = mongoose.model('Vendor', vendorSchema);
