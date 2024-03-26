const express = require('express')
const router = express.Router()
const Parent = require('../models/parent')
const jwt = require('jsonwebtoken');
const tokenBlacklist = new Set();

const createToken = (_id) => {
  return jwt.sign({_id}, process.env.SECRET, { expiresIn: '5m' })
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
  const { id, name,phoneNumber,homeAddress,password,email, parentalDetails,} = req.body;

  const parent = new Parent({
    personalInfo: {
      id: id,
      name: name,
      phoneNumber:phoneNumber,
      homeAddress: homeAddress,
      },
    parentalDetails: {
      parentRelationship: parentalDetails.parentRelationship
    },
    userAccountInfo:{
      email:email,
      password:password

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
  try {
    const { email, password } = req.body;

    const result = await Parent.signup(email, password);

    if (result.errors) {
      // If there are errors, send them to the frontend
      return res.status(400).json({ errors: result.errors });
    }

    // create a token
    const token = createToken(result.parent._id);

    res.status(200).json({ email, token, parent: result.parent });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//Edit parent and related schema information
router.patch('/:email', async (req, res) => {
  try {
    const parent = await Parent.findOne({ 'userAccountInfo.email': req.params.email });
    if (!parent) {
      return res.status(404).json({ error: "Parent not found" });
    }
    if (req.body.personalInfo) {
         Object.assign(parent.personalInfo, req.body.personalInfo);
       }
      
       if (req.body.parentalDetails) {
         Object.assign(parent.parentalDetails, req.body.parentalDetails);
       }

          
    await parent.save();
    res.status(200).json(parent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.post('/signOut', async (req, res) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ success: false, message: 'Authorization fail!' });
      }
      
        tokenBlacklist.add(token);
      
  
      res.json({ success: true, message: 'Sign out successfully!' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await Parent.login(email, password);

    if (result.errors) {
      // If there are errors, send them to the frontend
      return res.status(400).json({ errors: result.errors });
    }

    // If login was successful, create a token
    const token = createToken(result.parent._id);

    res.status(200).json({ email, token, parent: result.parent });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/deposit', async (req, res) => {
  try {
    const { childId, amount } = req.body;

    // Validate input data
    if (!childId || !amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Find the child by ID
    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Update the child's allowance balance
    child.financialInformation.allowanceBalAmount += parseFloat(amount);

    // Update the corresponding parent's allowance balance
    const parent = await Parent.findOne({ 'children._id': childId });
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found for the child' });
    }
    parent.financialInformation.allowanceBalAmount += parseFloat(amount);

    // Save changes to the database
    await child.save();
    await parent.save();

    res.json({ message: 'Deposit successful' });
  } catch (error) {
    console.error('Error depositing money:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



module.exports = router