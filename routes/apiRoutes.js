'use strict'

const express = require('express')
const api = express.Router()
const roleGuia = require('../middleware/roleGuia')
const ejemploController = require('../controllers/ejemploController')
const recorridoController = require('../controllers/recorridoController')

//user controllers
api.get('/user/',roleGuia,  ejemploController.getEjemplos);
//api.get('/user/:userId', ejemploController.getEjemplo );
//api.post('/user/',  ejemploController.postUEjemplo);
//api.put('/user/:userId',  ejemploController.updateEjemplo);
//api.delete('/user/:userId' ejemploController.deleteEjemplo);

//recorrido controllers
api.get('/recorrido/', roleGuia,  recorridoController.getRecorridos);
api.get('/recorrido/:recorridoId', roleGuia,  recorridoController.getRecorrido);
api.post('/recorrido/', roleGuia,  recorridoController.postRecorrido);
api.put('/recorrido/:recorridoId', roleGuia,  recorridoController.updateRecorrido);
api.delete('/recorrido/:recorridoId', roleGuia,  recorridoController.deleteRecorrido);

module.exports = api;