'use strict'

require('dotenv').config()

const chalk = require('chalk')
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./middleware/isAuth')

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

//import routes
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');


//Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); 
app.use(auth); //authentication, solo si la ruta no es '/auth/signup o /auth/signin'

//Routes
app.use('/api',apiRoutes)
app.use('/auth',authRoutes)

//database connection + server listening
mongoose.connect(process.env.DB, {useNewUrlParser:true, useUnifiedTopology:true}, (err,res) =>{
    if(err) {
        return console.log(chalk.red(`Error al intentar conectarse a la base de datos - ${err}`))
    }
    console.log(chalk.green('Base de datos conectada..'))

    server.listen(process.env.PORT, () => {
        console.log(chalk.blue(`Corriendo en puerto: ${process.env.PORT}`))
    });
});
//io listener
/** 
const recorridosActivosManager = require('./service/recorridoService');
const recorridosActivos = recorridosActivosManager.getRecorridosActivos();
const recorridosPorEmpezar = recorridosActivos.filter(function(recorrido){
    return recorrido.estado == 'Por empezar';
});
const recorridosEnCurso = recorridosActivos.filter(function(recorrido){
    return recorrido.estado == 'En curso';
});*/

let recorridosPorEmpezarSocket = [];
let recorridosEnCursoSocket = [];
io.on('connection', (socket) => {
    /*recorridosPorEmpezarSocket = recorridosPorEmpezarSocket.filter((recorrido) =>{
        let i = 0;
        let isRecorridoEncontrado = false;
        while(i< recorridosPorEmpezar.length && !isRecorridoEncontrado){
           if(recorridosPorEmpezar[i]._id.toString() == recorrido.id){
               isRecorridoEncontrado = true;
           }else{
               i++;
           }
        }
        return isRecorridoEncontrado;
    })*/
    socket.emit('guidesData', recorridosPorEmpezarSocket);

    socket.on('shareGuideLocation', (data) => {
        recorridosPorEmpezarSocket = recorridosPorEmpezarSocket.map((recorrido)=>{
            if(recorrido.id == data.key){
                recorrido.locationActual = data.coordinates;
            }
                return recorrido;
        })
        socket.broadcast.emit('guideData', data); //Crear en front un socket.on('guideData', (data)=> etc.) que recibe los datos del guia
    });

    socket.on('shareRecorridoActivo', (data) =>{
        const recorrido = {
            locationActual: data.coordinates,
            recorrido: data.recorrido,
            id: data.key,
        }
        let i = 0;
        let isRecorridoEncontrado = false;
        while(i< recorridosPorEmpezarSocket.length && !isRecorridoEncontrado){
           if(recorridosPorEmpezarSocket[i].key == data.key){
               isRecorridoEncontrado = true;
           }else{
               i++;
           }
        }

        if(isRecorridoEncontrado){
            recorridosPorEmpezarSocket[i].locationActual = data.coordinates;
            socket.join(data.key);
        }else{
            recorridosPorEmpezarSocket.push(recorrido);
            socket.join(data.key);
        }
        let location = {
            key: data.key,
            coordinates: data.coordinates,
        }
        socket.broadcast.emit('guideData', location)
    });

    socket.on('cancelarRecorrido', (data)=>{
        const nuevaLista =  recorridosPorEmpezarSocket.filter((recorrido) => {
           return recorrido.id != data.key;
        });
        recorridosPorEmpezarSocket = nuevaLista;
        socket.emit('guidesData', recorridosPorEmpezarSocket);
    })

    socket.on('iniciarRecorrido', (data)=>{
        const recorridoEncontrado = recorridosPorEmpezarSocket.find(recorrido => recorrido.id == data.key); 
        recorridosEnCursoSocket.push(recorridoEncontrado);
        const nuevaLista =  recorridosPorEmpezarSocket.filter((recorrido) => {
            return recorrido.id != data.key;
         });
         recorridosPorEmpezarSocket = nuevaLista;
    })
    
    socket.on('joinRecorrido', (recorrido) =>{
        socket.join(recorrido);  
    });
    
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
});