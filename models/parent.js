const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')

const childSchema = new mongoose.Schema({
  childFullName: {
    type: String,
  },
  gradeClass: {
    type: String,
  },
  studentID: {
    type: String,
  },
  financialInformation: {
    allowanceBalAmount: {
      type: Number,
      required: false,
    },
    allowanceAmount: {
      type: Number,
    },
    allowanceFrequency: {
      type: String,
      enum: ['Weekly', 'Monthly'],
      
    }
  },
});

const parentSchema = new mongoose.Schema({
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
  parentalDetails: {
    parentRelationship: {
      type: String,
      enum: ['Father', 'Mother'],
      
    },
  },
  children: [childSchema], // Array of child documents
  financialInformation: {
    allowanceBalAmount: {
      type: Number,
      required: false,
    },
    allowanceAmount: {
      type: Number,
      
    },
    allowanceFrequency: {
      type: String,
      enum: ['Weekly', 'Monthly'],
      
    }
  },
 userAccountInfo:{
  email: {
    type: String,
    required: true
  }
  ,
  password: {
    type: String,
    required: true,

  }
 }
});

// static signup method
parentSchema.statics.signup = async function(email, password) {

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

    const parent = await this.create({
      userAccountInfo: { email, password: hash }})
  return parent
}

// static login method
parentSchema.statics.login = async function(email, password) {
  try {
    if (!email || !password) {
      throw new Error('All fields must be filled');
    }

    const parent = await this.findOne({ 'userAccountInfo.email': email });
    if (!parent) {
      throw new Error('Incorrect email or password');
    }

    const match = await bcrypt.compare(password, parent.userAccountInfo.password);
    if (!match) {
      throw new Error('Incorrect email or password');
    }

    return { success: true, parent };
  } catch (error) {
    console.error(error);
    throw new Error('Internal Server Error',error);
  }
};



module.exports = mongoose.model('Parent', parentSchema);