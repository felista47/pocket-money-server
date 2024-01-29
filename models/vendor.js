const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  personalInformation: {
    id:{
      type: Number,
      required: true,
    },
    fullName: {
      type: String,
      required: true
    },
    contactInformation: {
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
  servicesProvided: [
    {
      type: String,
      required: true
    }
  ],
  paymentDetails: {
    tillName: {
      type: String,
      enum: ['M-PESA', 'Other'],
      required: true
    },
    tillHolderName: {
      type: String,
      required: true
    },
    tillNumber: {
      type: String,
      required: true
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

module.exports = mongoose.model('Vendor', vendorSchema);
