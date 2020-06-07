'use strict'

const express = require('express')
const api = express.Router()
const auth = require('../middleware/auth')
const userController = require('../controllers/userController')

api.get('/user/', userController.getUsers);
api.get('/user/:userId', userController.getUser );
api.post('/user/',  userController.postUser);
api.put('/user/:userId',  userController.updateUser);
api.delete('/user/:userId',auth.isAuth,  userController.deleteUser);

module.exports = api;