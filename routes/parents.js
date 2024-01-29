const express = require('express')
const router = express.Router()
const Parent = require('../models/parent')
const mongoose = require('mongoose')

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

// get by id
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    const parent = await Parent.findById(req.params.id);
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
  const { id, name, contactInfo, homeAddress, parentalDetails, children, financialInformation } = req.body;

  const parent = new Parent({
    personalInfo: {
      id: id,
      name: name,
      contactInfo: {
        phoneNumber: contactInfo.phoneNumber,
        emailAddress: contactInfo.emailAddress
      },
      homeAddress: homeAddress
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


//  update parent details
router.patch('/:id', async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id);

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

module.exports = router