const mongoose = require('mongoose')

const childSchema = new mongoose.Schema({
  parent: {
    type: String,
    ref: 'Vendor',
    required: true
  },
  studentID: {
    type: String,
          default: '',
  },
  childFullName: {
    type: String,
          default: '',
  },
  gradeClass: {
    type: String,
          default: '',
  },
  BalAmount: {
    type: Number,
    default: 0,
    min: 0 ,
    validate: {
      validator: (value) => value >= 0,
      message: 'Allowance balance must be non-negative'
    }
  },
  AllowanceLimit: {
    type: Number,
    default: null,
    min: 0 
  },
  Frequency: {
    type: String,
    enum: ['Weekly', 'Monthly'],
    default: null,
  }
});
module.exports = mongoose.model('Child', childSchema);