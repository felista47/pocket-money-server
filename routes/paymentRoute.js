const express = require('express');
const router = express.Router();

const {submitOrder,confirmPayment,getTransactionStatus}= require('../controllers/paymentControllers')


router.post('/', submitOrder,getTransactionStatus);

//confirmation 
router.get('/confirmation',confirmPayment);


module.exports = router;
