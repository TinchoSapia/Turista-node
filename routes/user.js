'use strict'

const express = require('express')
const user = express.Router()
const auth = require('../middleware/auth')
const userController = require('../controllers/userController')

user.post('/signup/', userController.signUp)
user.get('/signin/', userController.signIn)
user.get('/private', auth, (req,res)=>{
    res.status(200).send('Tienes Acceso')
})
module.exports = user;