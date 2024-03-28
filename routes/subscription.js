const express = require('express');
const User = require('../models/User');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');


router.get('/subscriptionsRequest', async (req, res) => {
    try {
        const usersWithPendingSubscriptions = await User.find({ subscriptionStatus: 'pending' }).select('-password');
        res.json(usersWithPendingSubscriptions);
    } catch (error) {
        console.error('Error fetching users with pending subscriptions:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.put('/accept/:subscriptionId', async (req, res) => {
    const userId = req.params.subscriptionId;
    try {
       
        const updatedSubscription = await User.findByIdAndUpdate(
            userId,
            { subscriptionStatus: 'accepted' }, 
            { new: true } 
        );

        res.json(updatedSubscription);
    } catch (error) {
        console.error('Error accepting subscription:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
