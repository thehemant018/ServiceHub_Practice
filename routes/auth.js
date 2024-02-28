const express = require('express')
const User = require('../models/User');
const bcrypt=require('bcrypt');
const { body, validationResult } = require('express-validator');
const router = express.Router();
var jwt=require('jsonwebtoken');
const JWT_SECRET='TumseNaHoPayega';
var fetchuser=require('../middleware/fetchuser')

router.post('/createuser', [
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
        let user=await User.findOne({email:req.body.email});
        if(user){
            return res.status(400).json({success,error:'Sorry a user with this mail already exist'});
        }

        const salt=await bcrypt.genSalt(10);
        const secPass=await bcrypt.hash(req.body.password,salt);

        user=User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });
        const data={
            user:{
                id:user.id
            }
        }
        const authToken=jwt.sign(data,JWT_SECRET);
        success=true;
        res.json({success,authToken});
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal server Error');
    }
})

router.post('/login',[
    body('email','Enter valid email').isEmail(),
    body('password',  'Passwords cannot be blank').exists()
],async(req,res)=>{
    let success=false;
    let errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success,errors: errors.array()});
    }
    const {email,password}=req.body;
    try {
        let user=await User.findOne({email});
        if(!user){
            success=false;
            return res.status(400).json({success,error:'Please try to login with correct credentials'});
        }

        // compare  the passwords using bcrypt
        const comparepassword=await bcrypt.compare(password,user.password)
        if(!comparepassword){
            success=false;
            return res.status(400).json({success,error:'Please try to login with correct credentials'});
        }
        const data={
            user:{
                id:user.id
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


router.get('/getuser',fetchuser,async(req,res)=>{
    try {
        var userId=req.user.id;
        const user=await User.findById(userId).select("-password");
        res.send(user)
       
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal server Error');
    }
})

module.exports = router;