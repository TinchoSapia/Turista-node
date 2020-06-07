'use strict'

const express = require('express')
const api = express.Router()
const auth = require('../middleware/auth')
const userController = require('../controllers/userController')

//api.get('/user/', ejemploController.getEjemplos);
//api.get('/user/:userId', ejemploController.getEjemplo );
//api.post('/user/',  ejemploController.postUEjemplo);
//api.put('/user/:userId',  ejemploController.updateEjemplo);
//api.delete('/user/:userId' ejemploController.deleteEjemplo);

api.post('/singup/', userController.singUp)
api.post('/singup/', userController.singIn)
api.get('/private', auth, (req,res)=>{
    res.status(200).send('Tienes Acceso')
})
module.exports = api;