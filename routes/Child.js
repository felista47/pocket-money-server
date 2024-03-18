const express = require('express');
const router = express.Router();
const Child = require('../models/Child'); 


router.get('/parent/:parentEmail', async (req, res) => {
  const parentEmail = req.params.parentEmail;

  try {
    const children = await Child.find({ parent: parentEmail });
    res.json(children);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error children', details: err.message });
  }
});

router.post('/', async (req, res) => {
   try {
    const newChild = new Child({
      parent: req.body.parent,
      childFullName: req.body.childFullName,
      gradeClass: req.body.gradeClass,
      studentID: req.body.studentID,
      financialInformation: {
        allowanceBalAmount: req.body.allowanceBalAmount || 0, 
        allowanceAmount: req.body.allowanceAmount || 0, 
        allowanceFrequency: req.body.allowanceFrequency,
      },
    });

        const savedChild = await newChild.save();
        res.status(201).json(savedChild);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating child' });
    }
});

router.get('/:studentID', async (req, res) => {
    try {
      const child = await Child.findOne({ studentID: req.params.studentID });
      if (!child) return res.status(404).json({ message: 'Child not found' });
      res.json(child);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error finding child' });
    }
  });
  
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
  router.put('/checkOut/:studentID', async (req, res) => {
    try {
        const updateObject = {};
        console.log(req.body); // Log the entire request body

        if (req.body.financialInformation) {
            const { allowanceBalAmount } = req.body.financialInformation;
            console.log(allowanceBalAmount); // Log the extracted allowance amount

            if (allowanceBalAmount !== undefined) {
                // Use $inc to decrement allowanceBalAmount
                updateObject.$inc = { 'financialInformation.allowanceBalAmount': -allowanceBalAmount };
            } else {
                return res.status(400).json({ message: 'Allowance amount not provided' });
            }
        } else {
            return res.status(400).json({ message: 'Financial information not provided' });
        }

        const updatedChild = await Child.findOneAndUpdate(
            { studentID: req.params.studentID },
            updateObject,
            { new: true } // Return the updated document
        );
        console.log(updatedChild);

        if (!updatedChild) return res.status(404).json({ message: 'Child not found' });
        res.json(updatedChild);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating child' });
    }
});

  

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
      if (req.body.financialInformation) {
        const { allowanceBalAmount,allowanceAmount,allowanceFrequency} = req.body.financialInformation;
        if (allowanceBalAmount !== undefined) {
          updateObject.$inc = { 'financialInformation.allowanceBalAmount': allowanceBalAmount }; // Use $inc for addition
        }
        if (allowanceAmount !== undefined) {
            updateObject['financialInformation.allowanceAmount'] = allowanceAmount;
          }
          if (allowanceFrequency !== undefined) {
            updateObject['financialInformation.allowanceFrequency'] = allowanceFrequency;
          }
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
