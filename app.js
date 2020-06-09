'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const api = require('./routes/index')
const auth = require('./middleware/isAuth')

const app = express();
const authRoutes = require('./routes/authRoutes')


//Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); 
app.use(auth); //authentication, solo si la ruta no es '/auth'

//Routes
app.use('/api',api)
app.use('/auth',authRoutes)



module.exports = app;
