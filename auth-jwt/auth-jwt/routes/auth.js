const express = require('express');
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const verifyAuth = require('./jwtauth')
const router = express.Router();
const User = require('../models/user');
dotenv.config()


//Input Validation
const Schema = Joi.object({
    username : Joi.string().lowercase().disallow(' ').required().min(6),
    password : Joi.string().min(8).required()
})

router.post('/login', async (req,res)=>{
    // Check logged in or not
    const token = req.cookies.token
    if(token) return  res.redirect('/');

    let user = await User.findOne({username: req.body.username})
    if (!user) return  res.redirect('/login/?message=wrongcreds');
    if(await bcrypt.compare(req.body.password,user.password)){
         //create token
         const token = jwt.sign({_id : user._id}, process.env.TOKEN_SECRET,{expiresIn: '30m'})
         res.cookie('token',token,{httpOnly: true, maxAge: 30 * 60 * 1000}).redirect('/user/')
    }else {
         res.redirect('/login/?message=wrongcreds');
    }
})

router.get('/',verifyAuth ,async (req,res)=>{
    const token = req.cookies.token
    const data = jwt.verify(token,process.env.TOKEN_SECRET)
    try{
        const user = await User.findById(data._id)
        res.render('user',{user : user})
    }catch(err){
        console.log(err)
    }
    
})

router.post('/register', async (req, res) => {
    // Check logged in or not
    const token = req.cookies.token
    if(token) return  res.redirect('/');

    //Input Validation
    const inputValidation = Schema.validate(req.body)
    if (inputValidation.error) {
        var message = encodeURIComponent(inputValidation.error.details[0].message)
         res.redirect('/register/?message='+message);
    }else {
        // check duplication
        let existing = await User.findOne({username: req.body.username})
        if(existing){
             res.redirect('/register/?message=user+exist')
        }else {
            // saving data
            let user = new User({
                username: req.body.username,
                password: await bcrypt.hash(req.body.password,10)
            })
            try{
                user = await user.save()
                res.redirect('/login');
            }catch(err){
                console.log(err)
                res.redirect('/register');
            }
        }

        
    }
});

router.post('/logout', (req, res) => {
    // logout
    const token = req.cookies.token
    if(!token) return res.redirect('/login');

    // make the token expires
    res.clearCookie('token').redirect('/login')
    
});

router.delete('/:id',verifyAuth, async (req,res) => {
    try{
        let user = await User.findByIdAndDelete(req.params.id)
        var message = encodeURIComponent("Deleted Successfully")
        res.redirect('/?message='+message)
    }catch(err){
        console.log(err)
        var message = encodeURIComponent("Error while deleting")
        res.redirect('/?message='+ message);
    }
    
})




module.exports = router