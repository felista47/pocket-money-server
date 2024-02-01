const express = require('express')
const router = express.Router()
const Parent = require('../models/parent')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');

const createToken = (_id) => {
  return jwt.sign({_id}, process.env.SECRET, { expiresIn: '3d' })
}
// get all parents
router.get('/', async (req, res) => {
  try {
    const parents = await Parent.find();
    res.json(parents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// get by email
router.get('/:email', async (req, res) => {
  try {
    const parent = await Parent.findOne({ 'userAccountInfo.email': req.params.email });
 console.log(parent)
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    res.json(parent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// add a new parent
router.post('/', async (req, res) => {
  const { id, name, contactInfo, homeAddress,password, parentalDetails, children, financialInformation } = req.body;

  const parent = new Parent({
    personalInfo: {
      id: id,
      name: name,
      contactInfo: {
        phoneNumber: contactInfo.phoneNumber,
        email: contactInfo.email
      },
      homeAddress: homeAddress,
      password:password
    },
    parentalDetails: {
      parentRelationship: parentalDetails.parentRelationship
    },
    children: children.map(child => ({
      childFullName: child.childFullName,
      gradeClass: child.gradeClass,
      studentID: child.studentID,
      financialInformation: {
        allowanceBalAmount: child.financialInformation.allowanceBalAmount,
        allowanceAmount: child.financialInformation.allowanceAmount,
        allowanceFrequency: child.financialInformation.allowanceFrequency
      }
    })),

    financialInformation: {
      allowanceBalAmount: financialInformation.allowanceBalAmount,
      allowanceAmount: financialInformation.allowanceAmount,
      allowanceFrequency: financialInformation.allowanceFrequency
    }
  });

  try {
    const savedParent = await parent.save();
    res.json(savedParent);
    console.log("Parent added successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving parent data');
  }
});

router.post('/signUp', async (req, res) => {
  const {email, password} = req.body

  try {
    const parent = await Parent.signup(email, password)

    // create a token
    const token = createToken(parent._id)

    res.status(200).json({email, token,parent})
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}); 

//  update parent details
router.patch('/:email', async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.email);

    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    // Update only the 'sub' field if it exists in the request body
    if (req.body.sub !== undefined) {
      parent.sub = req.body.sub;
    }

    const updatedParent = await parent.save();
    res.json(updatedParent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});



// Login route
router.post('/login', async (req, res) => {
    const {email, password} = req.body

    try {
      const parent = await Parent.login(email, password)
  
      // create a token
      const token = createToken(parent._id)
  
      res.status(200).json({email, token})
    } catch (error) {
      res.status(400).json({error: error.message})
    }
});




module.exports = router