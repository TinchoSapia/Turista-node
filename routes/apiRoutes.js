'use strict'

const express = require('express')
const api = express.Router()
const roleGuia = require('../middleware/roleGuia')
const roleTurista = require('../middleware/roleTurista')
const isAuth = require('../middleware/isAuth')
const userController = require('../controllers/userController')
const recorridoController = require('../controllers/recorridoController')
const recorridoInstanciaController = require('../controllers/recorridoInstanciaController')

//user controllers
api.get('/users/',isAuth,  userController.getUsuarios);
api.get('/user/', isAuth, userController.getUsuario );
api.put('/user/',isAuth,  userController.updateUsuario);
api.delete('/user/',isAuth, userController.deleteUsuario);

//recorrido base controllers
api.get('/recorrido/', roleGuia,  recorridoController.getRecorridos);
api.get('/recorrido/:recorridoId', roleGuia,  recorridoController.getRecorrido);
api.post('/recorrido/', roleGuia,  recorridoController.postRecorrido);
api.put('/recorrido/:recorridoId', roleGuia,  recorridoController.updateRecorrido);
api.delete('/recorrido/:recorridoId', roleGuia,  recorridoController.deleteRecorrido);

//recorrido instancia controllers
api.get('/recorridoInstancia/:recorridoInstanciaId', isAuth,  recorridoInstanciaController.getRecorridoInstancia);
api.post('/recorridoInstancia/', roleGuia,  recorridoInstanciaController.postRecorridoInstancia);
api.put('/recorridoInstancia/unirse/:recorridoId', roleTurista,  recorridoInstanciaController.unirseRecorridoInstancia);
api.put('/recorridoInstancia/abandonar/:recorridoId', roleTurista,  recorridoInstanciaController.abandonarRecorridoInstancia);
api.put('/recorridoInstancia/terminar/:recorridoId', roleGuia,  recorridoInstanciaController.terminarRecorridoInstancia);
api.delete('/recorridoInstancia/cancelar/:recorridoId', roleGuia,  recorridoInstanciaController.cancelarRecorridoInstancia);

module.exports = api;