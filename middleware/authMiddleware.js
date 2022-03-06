require('dotenv').config();
const jwt = require('jsonwebtoken');

const requireCustomerReservationAuth = (req,res,next) => {
    const token = req.cookies.customerJwt;

    if(token) {
       jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
           if(err) {
               console.log(err.message);
           } else {
               console.log(decodedToken);
               res.json({ redirect:'/reservation',isAuth:true })
           }
       })
    } else {
        res.json({ redirect:'/login',isAuth:false })
    }
    
}

const requireAdminAuth = (req,res) => {
    const token = req.cookies.adminJwt;

    if(token) {
        jwt.verify(token,process.env.SECRET,(err,decodedToken) => {
            if(err) {
                console.log(err)
            } else {
                console.log(decodedToken);
                res.json({ isAuth: true })
            }
        })
    } else {
        res.json({ isAuth: false, redirect:'/adminlogin' })
    }
    
}

module.exports = { requireCustomerReservationAuth,requireAdminAuth }