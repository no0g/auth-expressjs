const { urlencoded } = require('express')
const jwt = require('jsonwebtoken')

//middleware auth
module.exports = function(req,res,next) {
    const token = req.cookies.token
    if(!token){
        res.redirect('/login')
    }else {
        try{
            const verified = jwt.verify(token, process.env.TOKEN_SECRET)
            // console.log(verified)
            next()
        }catch(err){
            console.log(err)
            var message = encodeURIComponent('Please Login')
             res.redirect('/login?message='+message);
        }
    }

    
}