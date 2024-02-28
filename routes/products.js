const express = require('express')
const router = express.Router()
const Product = require('../models/product')
const mongoose = require('mongoose')

// get all products
router.get('/vendors/:vendorEmail', async (req, res) => {
  const vendorEmail = req.params.vendorEmail;

  try {
    const products = await Product.find({ vendor: vendorEmail });
    res.json(products);
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
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});
// //getby product category
router.get('/:vendorEmail/category/:category', async (req, res) => {
  const category = req.params.category;
  const vendorEmail = req.params.vendorEmail;

  try {
    const products = await Product.find({ vendor : vendorEmail, productCategory: category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// add a new product
router.post('/', async (req, res) => {
  const { vendor, productImage,productName,productDescription,productCategory,productAmount,} = req.body;

  const product = new Product({
    vendor:vendor,
    productImage,
      productName,
      productDescription,
      productCategory,
      productAmount,
    
  });

  try {
    const savedProduct = await product.save();
    res.json(savedProduct);
    console.log("Product added successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving product data');
  }
});

//  update product details
router.patch('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update only the 'sub' field if it exists in the request body
    if (req.body.sub !== undefined) {
      product.sub = req.body.sub;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});
// search componets
router.get('/Search/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Use a regex to perform a case-insensitive search
    const regex = new RegExp(query, 'i');

    const searchResults = await Product.find({
      $or: [
        { productName: { $regex: regex } },
        { productDescription: { $regex: regex } },
        { productCategory: { $regex: regex } },
      ],
    });

    res.json(searchResults);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router