const mongoose = require('mongoose')

const financialSchema = new mongoose.Schema({
    allowanceBalAmount: {
      type: Number,
      default: null,
      min: 0 ,
      validate: {
        validator: (value) => value >= 0,
        message: 'Allowance balance must be non-negative'
      }
  
    },
    allowanceAmount: {
      type: Number,
      default: null,
      min: 0 
  
    },
    allowanceFrequency: {
      type: String,
      enum: ['Weekly', 'Monthly'],
      default: null,
    }
  });

const childSchema = new mongoose.Schema({
  parent: {
    type: String,
    ref: 'Vendor',
    required: true
  },
  childFullName: {
    type: String,
          default: '',
  },
  gradeClass: {
    type: String,
          default: '',
  },
  studentID: {
    type: String,
          default: '',
  },
  financialInformation: financialSchema,

});
module.exports = mongoose.model('Child', childSchema);