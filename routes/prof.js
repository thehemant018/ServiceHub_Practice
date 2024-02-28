const express = require('express');
const Professional = require('../models/professional');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'TumseNaHoPayega';
var fetchuser = require('../middleware/fetchuser')
var fetchuser = require('../middleware/fetchprofs')
const router = express.Router();


router.get('/fetchprofssional', fetchprofs, async (req, res) => {
    try {
        const profs = await Professional.find({ professional: req.professional.id });
        res.json(profs)
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Iternal server Error')
    }

})

router.post('/profcreateuser', [
    body('name', "Enter valid name").isLength({ min: 3 }),
    body('email', "Enter valid email").isEmail(),
    body('password', 'Passwords must not be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {

    // validate result
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        let professional = await Professional.findOne({ aadhar: req.body.aadhar });
        if (professional) {
            return res.status(400).json({ success, error: 'Sorry a user with this aadhar already exist' });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        professional = Professional.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
            aadhar: req.body.aadhar,
            category: req.body.category,
        });
        const data = {
            professional: {
                id: professional.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal server Error');
    }
});

router.post('/proflogin',[
    body('aadhar', "Enter valid aadhar").isLength({ min: 12,max:12 }),
    body('password',  'Passwords cannot be blank').exists()
],async(req,res)=>{
    let success=false;
    let errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success,errors: errors.array()});
    }
    const {aadhar,password}=req.body;
    try {
        let professional=await Professional.findOne({aadhar});
        if(!professional){
            success=false;
            return res.status(400).json({success,error:'Please try to login with correct credentials'});
        }

        // compare  the passwords using bcrypt
        const comparepassword=await bcrypt.compare(password,professional.password)
        if(!comparepassword){
            success=false;
            return res.status(400).json({success,error:'Please try to login with correct credentials'});
        }
        const data={
            professional:{
                id:professional.id
            }
        }
        const authToken=jwt.sign(data,JWT_SECRET);
        success=true;
        res.json({success,authToken})

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal server Error');
    }
})


router.get('/getprofs', fetchprofs, async (req, res) => {
    try {
        const profsId = req.professional.id;
        console.log('profsId:', profsId);

        const professional = await Professional.findById(profsId).select("-password");
        console.log('profession:', professional);

        if (!professional) {
            console.log('Professional not found');
            return res.status(404).json({ error: 'Professional not found' });
        }

        res.json(professional);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal server error');
    }
});


router.get('/fetchallprofessionals', async (req, res) => {
    try {
        const professionals = await Professional.find().select("-password");
        res.json(professionals);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal server error');
    }
});


router.post('/bookservice/:professionalId', async (req, res) => {
    try {
      const professional = await Professional.findById(req.params.professionalId);
  
      if (!professional) {
        return res.status(404).json({ error: 'Professional not found' });
      }
  
      // Perform booking logic here
      // You can update the professional's status, send notifications, etc.
  
      res.json({ success: true, message: 'Service booked successfully' });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  });

  router.post('/acceptservice/:requestId', async (req, res) => {
    try {
      // Assuming you have a ServiceRequest model
      // Update the model name and structure based on your actual implementation
      const serviceRequest = await Professional.findById(req.params.requestId);
  
      if (!serviceRequest) {
        return res.status(404).json({ error: 'Service request not found' });
      }
  
      // Perform logic to accept the service request
      // You can update the service request status, send notifications, etc.
  
      res.json({ success: true, message: 'Service request accepted successfully' });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  });

//   router.get('/fetchservicerequests', async (req, res) => {
//     try {
//       // Assuming you have a ServiceRequest model
//       const serviceRequests = await ServiceRequest.find();
  
//       res.json(serviceRequests);
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).send('Internal Server Error');
//     }
//   });

router.get('/fetchservicerequests', async (req, res) => {
    try {
      // Assuming you have a ServiceRequest model and the collection is named "professionals"
      const serviceRequests = await Professional.find();
  
      res.json(serviceRequests);
    } catch (error) {
      console.error('Error fetching service requests:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

module.exports = router;