'use strict'

const express = require('express')
const api = express.Router()
const roleGuia = require('../middleware/roleGuia')
const isAuth = require('../middleware/isAuth')
const userController = require('../controllers/userController')
const recorridoController = require('../controllers/recorridoController')

//user controllers
api.get('/users/',isAuth,  userController.getUsuarios);
api.get('/user/',isAuth, userController.getUsuario );
api.put('/user/:userId',isAuth,  userController.updateUsuario);
api.delete('/user/:userId',isAuth, userController.deleteUsuario);

//recorrido controllers
api.get('/recorrido/', roleGuia,  recorridoController.getRecorridos);
api.get('/recorrido/:recorridoId', roleGuia,  recorridoController.getRecorrido);
api.post('/recorrido/', roleGuia,  recorridoController.postRecorrido);
api.put('/recorrido/:recorridoId', roleGuia,  recorridoController.updateRecorrido);
api.delete('/recorrido/:recorridoId', roleGuia,  recorridoController.deleteRecorrido);

module.exports = api;