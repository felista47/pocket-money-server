const mongoose = require('mongoose')

const TransactionsSchema = new mongoose.Schema({

    parent:{
        type: String,
        required:true,
    },
      Amount:{
        type: Number,
        required:true,
      },
      createdAt:{
        type: Date,
        required:true,
      },
      confirmationCode:{
        type: String,
        required:true,
      },
      paymentAccount:{
        type:String,
        required: true,
      }
 })
 module.exports = mongoose.model('Transactions',TransactionsSchema);