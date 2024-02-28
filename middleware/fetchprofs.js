// var jwt=require('jsonwebtoken');
// var JWT_SECRET='TumseNaHoPayega';
// fetchprofs=(req,res,next)=>{
//     const token=req.header('auth-token');
//     if(!token){
//         res.status(401).send({ error: 'Please authenticate using valid token' });
//     }
//     try {
//         const data=jwt.verify(token,JWT_SECRET);
//         console.log(data);
//         req.professional=data.professional;
//         next();
//     } catch (error) {
//         res.status(401).send({ error: 'Please authenticate using valid token' });
//     }
// }
// module.exports=fetchprofs;
var jwt = require('jsonwebtoken');
var JWT_SECRET = 'TumseNaHoPayega';

fetchprofs = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ error: 'Please authenticate using a valid token' });
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        console.log(data);
        req.professional = data.professional;
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        res.status(401).send({ error: 'Please authenticate using a valid token' });
    }
};

module.exports = fetchprofs;
