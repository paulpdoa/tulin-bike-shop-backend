require('dotenv').config();
const jwt = require('jsonwebtoken');

const requireCustomerAuth = (req,res,next) => {
    const token = req.cookies.customerJwt;

    if(token) {
       jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
           if(err) {
               console.log(err.message);
           } else {
               console.log(decodedToken);
               res.json({ redirect:'/' })
               next();
           }
       })
    }
    res.json({ redirect:'/login' });
}

module.exports = { requireCustomerAuth }