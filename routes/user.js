'use strict'

const express = require('express')
const User = express.Router()
const auth = require('../middleware/auth')
const userController = require('../controllers/userController')

User.post('/signup/', userController.signUp)
User.get('/signin/', userController.signIn)
User.get('/private', auth, (req,res)=>{
    res.status(200).send('Tienes Acceso')
})
module.exports = User;