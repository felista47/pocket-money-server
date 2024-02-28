const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  vendor: {
    type: String,
    ref: 'Vendor',
    required: true
  },
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
      default:'',
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