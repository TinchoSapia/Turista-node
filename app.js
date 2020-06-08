'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const api = require('./routes/index')
const Auth = require('./middleware/auth')

const app = express();
const user = require('./routes/user')

app.use(Auth)


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/api',api)
app.use('/user',user)



module.exports = app;
