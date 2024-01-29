const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  productImage: {
    type: String,
    required: true
  },
 
  productName: {
    type: String,
    required: true
  },
 
productDescription: {
      type: String,
      required: true,
    },
    productCategory:{
      type: String,
      enum :['Food','stationery','others'],
      required: true
    },
 productAmount: {
      type: Number,
      required: true
    },
// available: {
//   type: Boolean,
//   default: true
//     }

});
module.exports = mongoose.model('Product', productSchema);