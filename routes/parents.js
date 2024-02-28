const express = require('express')
const router = express.Router()
const Parent = require('../models/parent')
const Child = require('../models/parent')
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

router.patch('/:email', async (req, res) => {
  try {
    const parent = await Parent.findOne({ 'userAccountInfo.email': req.params.email });

    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    // Update only the fields that are provided in the request body
    if (req.body.personalInfo) {
      Object.assign(parent.personalInfo, req.body.personalInfo);
    }

    if (req.body.parentalDetails) {
      Object.assign(parent.parentalDetails, req.body.parentalDetails);
    }

    // Handle financial information update
    if (req.body.financialInformation) {
      const { allowanceBalAmount, allowanceAmount, allowanceFrequency } = req.body.financialInformation;
      if (allowanceBalAmount !== undefined) {
        parent.financialInformation.allowanceBalAmount = allowanceBalAmount;
      }
      if (allowanceAmount !== undefined) {
        parent.financialInformation.allowanceAmount = allowanceAmount;
      }
      if (allowanceFrequency) {
        parent.financialInformation.allowanceFrequency = allowanceFrequency;
      }
    }

    // Handle children updates or creation
    if (req.body.children && req.body.children.length > 0) {
      // Iterate over children in the request body
      for (const childData of req.body.children) {
        let child;
        // Check if the child already exists by ID
        if (childData._id) {
          child = parent.children.id(childData._id);
        }

        // If the child doesn't exist, create a new child
        if (!child) {
          child = new Child(childData);
          parent.children.push(child);
        } else {
          // Update existing child fields
          Object.assign(child, childData);
        }
      }
    }

    const updatedParent = await parent.save();
    res.json(updatedParent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
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