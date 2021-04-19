const express = require('express');
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const dotenv = require('dotenv')
const cookieparser = require('cookie-parser')
const authRouter = require('./routes/auth')
const User = require('./models/user');
const app = express()
dotenv.config()
const PORT = process.env.SERVER_PORT || 3000
//connect DB
mongoose.connect(process.env.DB_URI,{ useUnifiedTopology: true , useNewUrlParser: true, useFindAndModify: false},() => console.log("Connected to MongoDB"))

//middlewares
app.set('view engine','ejs')
app.use(methodOverride('_method'));
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieparser())

//routing middleware
app.use('/user', authRouter)

app.get('/login', (req,res) => {
    //logged in or not
    const token = req.cookies.token
    if(token) return  res.redirect('/');
    
    //default value of form
    const user = new User()
    res.render('login',{query: req.query, user:user})
})

app.get('/register', (req, res) => {
    //logged in or not
    const token = req.cookies.token
    if(token) return  res.redirect('/');

    // default falue of form 
    const user = new User()
    res.render('register',{query:req.query, user: user})
})
app.get('/', async (req,res) =>{
    // pass cookie to page
    const cookies = req.cookies

    const user = await User.find()
    res.render('index', {users: user, cookies:cookies})
})
app.get('/*', (req,res) => {
    res.render('404');
})
app.listen(PORT, () => console.log("Server up n running in Port = "+PORT))