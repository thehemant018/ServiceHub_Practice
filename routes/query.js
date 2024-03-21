const express = require('express')
const Query = require('../models/Query');
const { body, validationResult } = require('express-validator');
const router = express.Router();


router.post('/upload-query', async (req, res) => {
    try {
      const { firstName, lastName, email, phone, message } = req.body;
  
      const newQuery = new Query({
        firstName,
        lastName,
        email,
        phone,
        message
      });
      await newQuery.save();
  
      res.status(201).json({ message: 'Query uploaded successfully' });
    } catch (error) {
      console.error('Error uploading query:', error);
      res.status(500).json({ error: 'Unable to upload query' });
    }
  });

  
module.exports = router;