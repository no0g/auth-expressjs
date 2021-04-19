const express = require('express');
const bcrypt = require('bcrypt')
const methodOverride = require('method-override')
const app = express()
app.use(express.json())
app.use(methodOverride('_method'));

const users = []

app.get('/users', (req,res) => {
    res.json(users)
}) 

//post add user
app.post('/users', async (req,res) => {
    try {
        const hashed = await bcrypt.hash(req.body.password, 10)
        const user = { username: req.body.username, password: hashed }
        users.push(user)
        res.status(201).send()
    } catch{
        res.status(500).send()
    }
    
})

//login

app.post('/users/login', async (req,res) =>{
    const user = users.find(user => user.username === req.body.username)
    if (user == null){
        return res.status(400).send("User Not Found")
    }
    try{
        if (await bcrypt.compare(req.body.password , user.password)){
            res.status(200).send('success')
        }else {
            
            res.status(500).send('failed')
        }
    } 
    catch{

    }
})

app.delete('/users/:username',(req,res)=>{
    const user = users.find(user => user.username === req.params.username)
    if(user == null){
        return res.status(400).send("Not Found");
    }else {
        const index = users.indexOf(req.params.username)
        try{
            users.splice(index,1)
            res.send('deleted')
        }
        catch {
            res.send('failed')
        }
    }
})

app.listen(3000)