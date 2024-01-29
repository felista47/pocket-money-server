const mongoose = require('mongoose')

const childSchema = new mongoose.Schema({
  childFullName: {
    type: String,
    required: true
  },
  gradeClass: {
    type: String,
    required: true
  },
  studentID: {
    type: String,
    required: true
  },
  financialInformation: {
    allowanceBalAmount: {
      type: Number,
      required: false,
    },
    allowanceAmount: {
      type: Number,
      required: true
    },
    allowanceFrequency: {
      type: String,
      enum: ['Weekly', 'Monthly'],
      required: true
    }
  },
});

const parentSchema = new mongoose.Schema({
  personalInfo: {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true
    },
    contactInfo: {
      phoneNumber: {
        type: String,
        required: true
      },
      emailAddress: {
        type: String,
        required: true
      }
    },
    homeAddress: {
      type: String,
      required: true
    }
  },
  parentalDetails: {
    parentRelationship: {
      type: String,
      enum: ['Father', 'Mother'],
      required: true
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
      required: true
    },
    allowanceFrequency: {
      type: String,
      enum: ['Weekly', 'Monthly'],
      required: true
    }
  }
 
});

module.exports = mongoose.model('Parent', parentSchema);