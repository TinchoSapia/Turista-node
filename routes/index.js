'use strict'

const express = require('express')
const api = express.Router()
//const auth = require('../middleware/auth')
const roleGuia = require('../middleware/roleGuia')
const ejemploController = require('../controllers/ejemploController')

api.get('/user/',roleGuia,  ejemploController.getEjemplos);
//api.get('/user/:userId', ejemploController.getEjemplo );
//api.post('/user/',  ejemploController.postUEjemplo);
//api.put('/user/:userId',  ejemploController.updateEjemplo);
//api.delete('/user/:userId' ejemploController.deleteEjemplo);
module.exports = api;