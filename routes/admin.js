const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Admin = require('../models/Admin');

const JWT_SECRET = 'Ve mahiya mera jee karda ghar chhad ke malang ho jawan'; 


router.post('/createadmin', [
    body('email', 'Enter valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 })
], async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        
        let admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(400).json({ error: 'Admin with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        admin = new Admin({
            email,
            password: hashedPassword
        });

        await admin.save();

        res.status(200).json({ message: 'Admin created successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal server error');
    }
});

// Route to login admin
router.post('/loginadmin', [
    body('email', 'Enter valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check if admin with the provided email exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create and return JWT token
        const payload = {
            admin: {
                id: admin.id
            }
        };

        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
