const express = require('express');
const router = express.Router();
const IPN = require('../models/IPN'); 

const {submitOrder,confirmPayment,getTransactionStatus}= require('../controllers/paymentControllers')


router.post('/', submitOrder,getTransactionStatus);


// IPN

router.post('/ipn', async (req, res) => {
    const {url,created_date,ipn_id,error,status}=req.body
    try {
        const newIPN = new IPN({
            url:url,
            created_date:created_date,
            ipn_id:ipn_id,
            error:error,
            status:status
        })
        const savedIPN = await newIPN.save();
        res.status(201).json(savedIPN);
        console.log(savedIPN)
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error saving ipn' });
      }

})

router.get('/payment-callback', (req, res) => {
  console.log('callback',req.body);
  res.status(200).send('Callback received successfully.');
});
//confirmation 
router.get('/confirmation',confirmPayment);


module.exports = router;
