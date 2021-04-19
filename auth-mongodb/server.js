const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const User = require('./models/users')
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false}))
//connect mongodb
mongoose.connect('mongodb://localhost/auth', { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true})


app.get('/', async (req,res) =>{
    let users = await User.find()
    try{
         res.json(users);
    }catch{
        res.status(500).send('error');
    }
})

app.post('/register', async (req,res) =>{
    let user = new User({
        username: req.body.username,
        password: await bcrypt.hash(req.body.password,10)
    })
    if(await User.findOne({username: req.body.username})){
        res.status(301).send('user exist')
    }
    else {
        try{
            user = await user.save()
            res.status(200).send('success');
        }catch{
            res.status(500).send('failed');
        }
    }

})

app.post('/login', async (req,res)=>{
    let user = await User.findOne({username:req.body.username})
    if(await bcrypt.compare(req.body.password, user.password)){
        res.status(200).send('success');
    } else{
        res.status(401).send('unauthorized')
    }
})



app.listen(3000)