const express = require('express');
const Professional = require('../models/professional');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'TumseNaHoPayega';
var fetchuser = require('../middleware/fetchuser');
var fetchprofs = require('../middleware/fetchprofs');
var fetchprofsfororder = require('../middleware/fetchprofsfororder');
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


router.get('/fetchallprofessionals', async (req, res) => {
    try {
        const professionals = await Professional.find().select("-password");
        res.json(professionals);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal server error');
    }
});

//before 8 march 
// router.post('/bookservice/:professionalId', async (req, res) => {
//     try {
//       const professional = await Professional.findById(req.params.professionalId);

//       if (!professional) {
//         return res.status(404).json({ error: 'Professional not found' });
//       }

//       // Perform booking logic here
//       // You can update the professional's status, send notifications, etc.

//       res.json({ success: true, message: 'Service booked successfully' });
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).send('Internal Server Error');
//     }
//   });

//before 8 march 
//   router.post('/acceptservice/:requestId', async (req, res) => {
//     try {
//       // Assuming you have a ServiceRequest model
//       // Update the model name and structure based on your actual implementation
//       const serviceRequest = await Professional.findById(req.params.requestId);

//       if (!serviceRequest) {
//         return res.status(404).json({ error: 'Service request not found' });
//       }

//       // Perform logic to accept the service request
//       // You can update the service request status, send notifications, etc.

//       res.json({ success: true, message: 'Service request accepted successfully' });
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).send('Internal Server Error');
//     }
//   });



//10 March (part1 not include cutomer id)

// router.post('/bookservice/:professionalId', async (req, res) => {
//     try {
//       const { professionalId } = req.params;

//       // Create a new service request
//       const serviceRequest = new ServiceRequest({
//         professionalId,
//         status: 'pending', // You can change the default status if needed
//       });

//       // Save the service request to the database
//       await serviceRequest.save();
//       console.log(serviceRequest);
//       // Send a success response
//       res.status(201).json({ message: 'Service booked successfully', serviceRequest });
//     } catch (error) {
//       console.error('Error booking service:', error.message);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });


//10 march (part2)
router.post('/bookservice/:professionalId', fetchuser || fetchprofs, async (req, res) => {
    try {
        const { professionalId } = req.params;
        const { id: userId } = req.user; // Update 'user' to 'professional' or use 'req.professional' if using fetchprofs middleware
        // console.log('Professional ID:', professionalId);

        // console.log('User ID:', userId);
        const user_name = await User.findById(userId);
        const prof_name=await Professional.findById(professionalId);
        // console.log('User name',user_name.name);



        // Create a new service request with the professionalId, userId, and status
        const serviceRequest = new ServiceRequest({
            professionalId,
            customerId: userId,
            status: 'pending',
            customerName: user_name.name,
            professionalName:prof_name.name,
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
        
        // Save the service request to the database
        await serviceRequest.save();

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

        res.json({ success: true, message: 'Service request canceled successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});




module.exports = router;