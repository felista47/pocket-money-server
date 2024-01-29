const Vendor = require('../models/vendor');
const express = require('express')
const router = express.Router()


// get all vendors
router.get('/', async (req, res) => {
    try {
      const vendors = await Vendor.find();
      res.json(vendors);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  });
  // get vendor by id
router.get('/:id', async (req, res) => {
    try {
      const vendor = await Vendor.findById(req.params.id);
  
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
  
      res.json(vendor);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  });
// Create a new vendor instance

router.post('/', async (req, res) => {
  const { id, fullName, contactInfo, homeAddress, paymentDetails, additionalNotes, active ,servicesProvided} = req.body;

  const vendor = new Vendor({
    personalInformation: {
      id: id,
      fullName: fullName,
      contactInformation: {
        phoneNumber: contactInfo.phoneNumber,
        emailAddress: contactInfo.emailAddress
      },
      homeAddress: homeAddress
    },
    servicesProvided,
    paymentDetails: {
      tillName: paymentDetails.tillName,
      tillHolderName: paymentDetails.tillHolderName,
      tillNumber: paymentDetails.tillNumber
    },
    additionalNotes: additionalNotes,
    active: active
  });

  try {
    const savedVendor = await vendor.save();
    res.json(savedVendor);
    console.log("Vendor data added successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving vendor data');
  }
});


// update vendor details
router.patch('/:id', async (req, res) => {
    try {
      const vendor = await Vendor.findById(req.params.id);
  
      if (!vendor) {
        return res.status(404).json({ error: 'vender not found' });
      }
  
      // Update only the 'sub' field if it exists in the request body
      if (req.body.sub !== undefined) {
        vendor.sub = req.body.sub;
      }
  
      const updatedVendor = await vendor.save();
      res.json(updatedVendor);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  });

  module.exports = router
