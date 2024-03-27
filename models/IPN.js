const mongoose = require('mongoose')

const ipnSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  created_date: {
    type: String,
          default: '',
  },
  ipn_id: {
    type: String,
          default: '',
  },
  error: {
    type: Number,
    default: 0 
  },
  status: {
    type: String,
    default: '',
  }
});

module.exports=mongoose.model('IPN', ipnSchema)