const Vendor = require('../models/vendor');
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');

const createToken = (_id) => {
  return jwt.sign({_id}, process.env.SECRET, { expiresIn: '3d' })
}

// get all vendors not used in the app
router.get('/', async (req, res) => {
    try {
      const vendors = await Vendor.find();
      res.json(vendors);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  });


  // get vendor by email
  router.get('/:email', async (req, res) => {
    try {
      const vendor = await Vendor.findOne({ 'userAccountInfo.email': req.params.email });
  
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
  const { id, fullName,password,email,homeAddress, paymentDetails,active ,servicesProvided} = req.body;
  const vendor = new Vendor({
    personalInformation: {
      id: id,
      fullName: fullName,
      phoneNumber:phoneNumber,
      homeAddress: homeAddress
    },
    servicesProvided,
    paymentDetails: {
      tillName: paymentDetails.tillName,
      tillHolderName: paymentDetails.tillHolderName,
      tillNumber: paymentDetails.tillNumber
    },
    userAccountInfo:{
      email:email,
      password:password

    },
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

router.post('/signUp', async (req, res) => {
  const {email, password} = req.body

  try {
    const result = await Vendor.signup(email, password)

    if (result.errors) {
      // If there are errors, send them to the frontend
      return res.status(400).json({ errors: result.errors });
    }
    // create a token
    const token = createToken(vendor._id)

    res.status(200).json({email, token, vendor:result.vendor})
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}); 

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await Vendor.login(email, password);

    if (result.errors) {
      // If there are errors, send them to the frontend
      return res.status(400).json({ errors: result.errors });
    }

    // If login was successful, create a token
    const token = createToken(result.vendor._id);

    res.status(200).json({ email, token, vendor: result.vendor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// update vendor details
router.patch('/:email', async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ 'userAccountInfo.email': req.params.email });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const updateObject = {};

    if (req.body.personalInfo !== undefined) {
     updateObject.personalInfo= req.body.personalInfo;
    }

    if (req.body.shopInfo !== undefined) {
      // Copy shopInfo fields
      updateObject['shopInfo'] = { ...req.body.shopInfo };
      
      // Ensure that updateObject.$inc is defined
      if (!updateObject.$inc) {
          updateObject.$inc = {};
      }
      
      // Conditional update for shopBal
      if (req.body.shopInfo.shopBal !== undefined) {
          updateObject.$inc['shopInfo.shopBal'] = req.body.shopInfo.shopBal; // Assign new value directly
      }
  }
  

    if (req.body.userAccountInfo !== undefined) {
     updateObject.userAccountInfo = req.body.userAccountInfo;
    }

    if (req.body.servicesProvided !== undefined) {
      updateObject.servicesProvided = req.body.servicesProvided;
    }

    if (req.body.paymentDetails !== undefined) {
     updateObject.paymentDetails=req.body.paymentDetails;
    }

    if (req.body.active !== undefined) {
      vendor.active = req.body.active;
    }


    const updatedVendor = await Vendor.findOneAndUpdate(
      { 'userAccountInfo.email': req.params.email },
       updateObject,
      { new: true } // Return the updated document
    );

    if (!updatedVendor) return res.status(404).json({ message: 'vendor not found' });
    res.json(updatedVendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});



  module.exports = router
