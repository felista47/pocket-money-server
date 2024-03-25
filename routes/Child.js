const express = require('express');
const router = express.Router();
const Child = require('../models/Child'); 

// get student by parent email
router.get('/parent/:parentEmail', async (req, res) => {
  try {
    const { parentEmail } = req.params;
    const children = await Child.find({ parent: parentEmail }); // Find all children with matching email

    if (!children.length) {
      return res.status(404).json({ message: 'No children found for this parent email' });
    }

    res.json(children);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error children', details: err.message });
  }
});


//add a new student
router.post('/', async (req, res) => {
  try {
    const { studentID } = req.body;
    const existingChild = await Child.findOne({ studentID });

    if (existingChild) {
      return res.status(400).json({ message: 'Student with that ID already exists' });
    }

    const newChild = new Child({
      parent: req.body.parent,
      studentID: studentID,
      childFullName: req.body.childFullName,
      gradeClass: req.body.gradeClass,
      BalAmount: req.body.BalAmount || 0,
      AllowanceLimit: req.body.AllowanceLimit || 0,
      Frequency: req.body.Frequency,
    });

    const savedChild = await newChild.save();
    res.status(201).json(savedChild);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating child' });
  }
});

  //delete a student
router.delete('/:parentEmail/children/:childId', async (req, res) => {
  try {
    const { childId, parentEmail } = req.params;

    const deletedCount = await Child.deleteOne({
      _id: childId,
      parent: parentEmail
    });

    if (deletedCount.deletedCount === 0) {
      return res.status(404).json({ message: 'Child not found or does not belong to the specified parent' });
    }

    res.json({ message: 'Child deleted successfully' });
  } catch (error) {
    console.error('Error deleting child:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
  
  //sell endpoint
router.put('/checkout/:studentID', async (req, res) => {
  try {
    const updateObject = {};

    // Update financialInformation conditionally
    if (req.body.BalAmount !== undefined) {
      updateObject.$inc = { 'BalAmount': -req.body.BalAmount }; // Use $inc for subtraction
  }
  
    const updatedChild = await Child.findOneAndUpdate(
      { studentID: req.params.studentID },
      updateObject,
      { new: true } // Return the updated document
    );

    if (!updatedChild) return res.status(404).json({ message: 'Child not found' });
    res.json(updatedChild);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating child' });
  }
});
  

// update student details
router.put('/:studentID', async (req, res) => {
  try {
    const updateObject = {};

    // Update grade if present
    if (req.body.gradeClass !== undefined) {
      updateObject.gradeClass = req.body.gradeClass;
    }
    if (req.body.childFullName !== undefined) {
      updateObject.childFullName = req.body.childFullName;
    }

    // Update financialInformation conditionally
    if (req.body.BalAmount !== undefined) {
      updateObject.$inc = { 'BalAmount': req.body.BalAmount }; // Use $inc for addition
  }
  
      if (req.body.AllowanceLimit !== undefined) {
          updateObject.AllowanceLimit =req.body.AllowanceLimit;
        }
        if (req.body.Frequency !== undefined) {
          updateObject.Frequency =req.body.Frequency;
        }
    

    const updatedChild = await Child.findOneAndUpdate(
      { studentID: req.params.studentID },
      updateObject,
      { new: true } // Return the updated document
    );

    if (!updatedChild) return res.status(404).json({ message: 'Child not found' });
    res.json(updatedChild);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating child' });
  }
});
  
  
  

module.exports = router;
