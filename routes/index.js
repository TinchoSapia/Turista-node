'use strict'

const express = require('express')
const api = express.Router()
const userController = require('../controllers/userController')

api.get('/user/', userController.getUsers);
api.get('/user/:userId', userController.getUser );
api.post('/user/',  userController.postUser);
api.put('/user/:userId',  userController.updateUser);
api.delete('/user/:userId',  userController.deleteUser);

module.exports = api;