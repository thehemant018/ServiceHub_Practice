const express = require('express');
const Professional = require('../models/professional');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const Rating = require('../models/Rating');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'TumseNaHoPayega';
var fetchuser = require('../middleware/fetchuser');
var fetchprofs = require('../middleware/fetchprofs');
var fetchprofsfororder = require('../middleware/fetchprofsfororder');
const { sendEmail } = require("../controllers/acceptemailControllers");
const router = express.Router();
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

router.get('/fetchprofssional', fetchprofs, async (req, res) => {
    try {
        const profs = await Professional.find({ professional: req.professional.id });
        res.json(profs)
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Iternal server Error')
    }

})

//11 March
// router.post('/profcreateuser', [
//     body('name', "Enter valid name").isLength({ min: 3 }),
//     body('email', "Enter valid email").isEmail(),
//     body('password', 'Passwords must not be atleast 5 characters').isLength({ min: 5 })
// ], async (req, res) => {

//     // validate result
//     let success = false;
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ success, errors: errors.array() });
//     }

//     try {
//         let professional = await Professional.findOne({ aadhar: req.body.aadhar });
//         if (professional) {
//             return res.status(400).json({ success, error: 'Sorry a user with this aadhar already exist' });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const secPass = await bcrypt.hash(req.body.password, salt);

//         professional = Professional.create({
//             name: req.body.name,
//             email: req.body.email,
//             password: secPass,
//             aadhar: req.body.aadhar,
//             category: req.body.category,
//         });
//         const data = {
//             professional: {
//                 id: professional.id
//             }
//         }
//         const authToken = jwt.sign(data, JWT_SECRET);
//         success = true;
//         res.json({ success, authToken });
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send('Internal server Error');
//     }
// });


router.post(
    '/profcreateuser',
    [
        body('name', 'Enter a valid name').isLength({ min: 3 }),
        body('email', 'Enter a valid email').isEmail(),
        body('password', 'Passwords must be at least 5 characters').isLength({ min: 5 }),
        body('aadhar', 'Enter a valid Aadhar').isLength({ min: 12, max: 12 }),
        body('category', 'Enter a valid category').isString(),
        body('latitude', 'Enter valid latitude').isNumeric(),
        body('longitude', 'Enter valid longitude').isNumeric(),
    ],
    async (req, res) => {
        // validate result
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }

        try {
            let professional = await Professional.findOne({ aadhar: req.body.aadhar });
            if (professional) {
                return res.status(400).json({ success, error: 'Sorry, a user with this Aadhar already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);

            professional = await Professional.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass,
                aadhar: req.body.aadhar,
                city: req.body.city,
                address: req.body.address,
                category: req.body.category,
                location: {
                    type: 'Point',
                    coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
                },
            });

            const data = {
                professional: {
                    id: professional.id,
                },
            };
            const authToken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({ success, authToken });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Internal server error');
        }
    }
);

router.post('/proflogin', [
    body('aadhar', "Enter valid aadhar").isLength({ min: 12, max: 12 }),
    body('password', 'Passwords cannot be blank').exists()
], async (req, res) => {
    let success = false;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    const { aadhar, password } = req.body;
    try {
        let professional = await Professional.findOne({ aadhar });
        if (!professional) {
            success = false;
            return res.status(400).json({ success, error: 'Please try to login with correct credentials' });
        }

        // compare  the passwords using bcrypt
        const comparepassword = await bcrypt.compare(password, professional.password)
        if (!comparepassword) {
            success = false;
            return res.status(400).json({ success, error: 'Please try to login with correct credentials' });
        }
        const data = {
            professional: {
                id: professional.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken })

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


//17 march
router.get('/profdetail/:profId',async(req,res)=>{
    try {
        const {profId}=req.params;
        const detials=await Professional.findById(profId).select("-password");
        // console.log(detials)
        res.json(detials);
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



//15 March
let h=[fetchuser,fetchprofs]
router.post('/bookservice/:professionalId',  h , async (req, res) => {
    try {
        const { professionalId } = req.params;
        let userId; 
        let user_name; 
        userId = req.user.id; // If user is logged in
        user_name = await User.findById(userId);
        if (!user_name || Object.keys(user_name).length === 0) {
            // Applying fetchprofs middleware
            userId=req.professional.id; 
            await fetchprofs(req, res, async () => {
                // Now try fetching user_name again
                user_name = await Professional.findById(userId);
                console.log(user_name);
            });
        }
        const prof_name=await Professional.findById(professionalId);
        // console.log('User name',user_name.name);

        if (!user_name) {
            console.log('user')
            return res.status(404).json({ error: 'User not found' });
        }

        if (!prof_name) {
            return res.status(404).json({ error: 'Professional not found' });
        }

       
        const serviceRequest = new ServiceRequest({
            professionalId,
            customerId: userId,
            status: 'pending',
            customerName: user_name.name,
            customerEmail:user_name.email,
            professionalName:prof_name.name,
            professionalEmail:prof_name.email,
            serviceName:prof_name.category,
            userlocation: {
                type: 'Point',
                coordinates: [user_name.location.coordinates[0],user_name.location.coordinates[1] ],
            },
            proflocation: {
                type: 'Point',
                coordinates: [prof_name.location.coordinates[0],prof_name.location.coordinates[1] ],
            },
        });
        
        
        await serviceRequest.save();

        // console.log(user_name.email);
        // const subRouter = express.Router();
        // router.subRouter('/sendmail',sendEmail);

        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
              user: process.env.SMTP_MAIL, // generated ethereal user
              pass: process.env.SMTP_PASSWORD, // generated ethereal password
            },
          }); 
        
          const emailContent = `Dear ${prof_name.name}, your ${prof_name.category} related services with ${user_name.name} has been booked successfully please check further detials in portal.`;

        const mailOptions = {
            from: process.env.SMTP_MAIL,
            // to: 'mauryahemant202@gmail.com', // Sending email to the user
            to:serviceRequest.professionalEmail,
            subject: 'Service Booking Confirmation',
            text: emailContent, // You can customize the email content
        };
        
        await transporter.sendMail(mailOptions);
        console.log('mail send succesfuly')

        // Send a success response
        res.status(201).json({ message: 'Service booked successfully', serviceRequest });
    } catch (error) {
        console.error('Error booking service:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});









//10 March
// router.post('/acceptservice/:requestId', async (req, res) => {
//     try {
//         // console.log('Accept service request route hit');
//         // console.log('Request ID:', req.params.requestId);
//         const serviceRequest = await ServiceRequest.findById(req.params.requestId);

//         if (!serviceRequest) {
//             return res.status(404).json({ error: 'Service request not found' });
//         }

//         // For example, update the status to 'accepted'
//         serviceRequest.status = 'accepted';
//         await serviceRequest.save();

//         res.json({ success: true, message: 'Service request accepted successfully' });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Internal Server Error');
//     }
// });

//11march
router.post('/acceptservice/:requestId', fetchprofs, async (req, res) => {
    try {
        const profId = req.professional.id;
        const requestId = req.params.requestId;

        // Assuming you have a ServiceRequest model
        const serviceRequest = await ServiceRequest.findById(requestId);

        if (!serviceRequest) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        // Ensure that the professional accepting the request matches the professional ID in the service request
        if (serviceRequest.professionalId.toString() !== profId) {
            return res.status(403).json({ error: 'Unauthorized access to this service request' });
        }

        // For example, update the status to 'accepted'
        serviceRequest.status = 'accepted';
        await serviceRequest.save();

         //14 march
         let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
              user: process.env.SMTP_MAIL, // generated ethereal user
              pass: process.env.SMTP_PASSWORD, // generated ethereal password
            },
          }); 
        
          const emailContent=`Dear ${serviceRequest.customerName},

          We are pleased to inform you that your service request for ${serviceRequest.serviceName} has been accepted by our professional, ${serviceRequest.professionalName}.\n
          \tDate and Time of Service: ${serviceRequest.createdAt}\n
          Please ensure that you are available at the specified date, time, and location for the service.\n
          If you have any further questions or need assistance, feel free to contact us.\n\n
          Thank you for choosing our services,\n
          Servicehub`


     
        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: serviceRequest.customerEmail, // Sending email to the user
            subject: 'Service Acceptance Confirmation',
            text: emailContent, // You can customize the email content
        };
        
        await transporter.sendMail(mailOptions);
        console.log('mail send succesfuly')

        res.json({ success: true, message: 'Service request accepted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});


//10 march
// router.get('/fetchorderrequest', async (req, res) => {
//     try {
//         // Assuming you have a ServiceRequest model
//         const serviceRequests = await ServiceRequest.find();

//         res.json(serviceRequests);
//     } catch (error) {
//         console.error('Error fetching service requests:', error.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

//11March
router.get('/fetchorderrequest', fetchprofsfororder, async (req, res) => {
    try {
        const profId = req.professional.id;
        console.log(profId);
        // Assuming you have a ServiceRequest model
        const serviceRequests = await ServiceRequest.find({ professionalId: profId });

        res.json(serviceRequests);
    } catch (error) {
        console.error('Error fetching service requests:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//10 March
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



//11 March  
router.get('/booked-services/:customerId', fetchuser, async (req, res) => {
    try {
        const customerId = req.params.customerId;

        // Assuming ServiceRequest model has the necessary information about booked services
        const bookedServices = await ServiceRequest.find({ customerId });

        res.json(bookedServices);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});







//12 march

router.put(
    '/update-location',
    [
        fetchprofs, // Ensure the user is authenticated
        body('latitude', 'Enter a valid latitude').isNumeric(),
        body('longitude', 'Enter a valid longitude').isNumeric(),
    ],
    async (req, res) => {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const { latitude, longitude } = req.body;
            const profId = req.professional.id;

            // Update user's location in the database
            const updatedProfessional = await Professional.findByIdAndUpdate(
                profId,
                {
                    $set: {
                        location: {
                            type: 'Point',
                            coordinates: [parseFloat(longitude), parseFloat(latitude)],
                        },
                    },
                },
                { new: true }
            );

            res.json({ success: true, message: 'Location updated successfully', professional: updatedProfessional });
        } catch (error) {
            console.error('Error updating location:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
);




router.get('/fetchprofessionalsbycategory/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const professionals = await Professional.find({ category }).select("-password");
        res.json(professionals);
    } catch (error) {
        console.error('Error fetching professionals by category:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





//13 march (cancel service request)
router.put('/cancelservice/:requestId', fetchprofs || fetchuser, async (req, res) => {
    try {

        const requestId = req.params.requestId;
        //   const profId = req.professional.id ;// Assuming you have a professional ID in the authentication middleware

        // let profId;
        // if (req.professional && req.professional.id) {
        //     profId = req.professional.id;
        // } else if (req.user && req.user.id) {
        //     profId = req.user.id;
        // } else {
        //     throw new Error('User or professional ID not found');
        // }

        // Assuming you have a ServiceRequest model
        const serviceRequest = await ServiceRequest.findById(requestId);

        if (!serviceRequest) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        // Ensure that the professional canceling the request matches the professional ID in the service request

        // if (serviceRequest.professionalId.toString() !== profId) {
        //     return res.status(403).json({ error: 'Unauthorized access to cancel this service request' });
        // }

        // For example, update the status to 'canceled'
        serviceRequest.status = 'canceled';
        await serviceRequest.save();

        //14 march
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
              user: process.env.SMTP_MAIL, // generated ethereal user
              pass: process.env.SMTP_PASSWORD, // generated ethereal password
            },
          }); 
        
          const emailContent = `Dear ${serviceRequest.customerName},,

          We regret to inform you that your ${serviceRequest.serviceName} with ${serviceRequest.professionalName} service request has been canceled.\n
          Please feel free to contact us if you have any questions or require further assistance.\n\n
          Thank you,\n
          Servicehub`

          //14 march
        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: serviceRequest.customerEmail, // Sending email to the user
            subject: 'Service Cancellation Confirmation',
            text: emailContent, // You can customize the email content
        };
        
        await transporter.sendMail(mailOptions);
        console.log('mail send succesfuly')

        res.json({ success: true, message: 'Service request canceled successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});


//city wise display services
router.get('/fetchprofessionalsbycity/:city', async (req, res) => {
    const { city } = req.params;
    try {
      const professionals = await Professional.find({ city });
      res.json(professionals);
    } catch (error) {
      console.error('Error fetching professionals by city:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

  //fetch services
  router.get('/fetchservicedetail/:id',async(req,res)=>{
    const { id } = req.params;
    try{
        const service=await ServiceRequest.findById(id);
        res.json(service)
    }catch (error) {
        console.error('Error fetching professionals by city:', error.message);
        res.status(500).json({ error: 'Server error' });
      }
  })


  router.post('/ratings',async (req, res) => {
    try {
      const { serviceId, userId, profId,rating, feedback } = req.body;  
      const newRating = new Rating({
        serviceId,
        userId,
        profId,
        rating,
        feedback
      });
      await newRating.save();

      const professional = await Professional.findById(profId);

      if (!professional) {
          return res.status(404).json({ error: 'Professional not found' });
      }

   


    if (professional.ratings.hasOwnProperty(rating)) {
        professional.ratings[rating]++;
    } else {
        return res.status(400).json({ error: 'Invalid rating value' });
    }
      await professional.save();
    

      res.status(201).json({ message: 'Rating saved successfully' });
    } catch (error) {
      console.error('Error saving rating:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/getratings/:profId', async (req, res) => {
    try {
      const { profId } = req.params;
      
      // Find ratings with the specified profId
      const ratings = await Rating.find({ profId });
  
      res.json(ratings);
    } catch (error) {
      console.error('Error fetching ratings:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });




  

  // Assuming you're using Express.js

  
  //14 march 
//   router.post('/sendmail',sendEmail);


module.exports = router;