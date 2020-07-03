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
   //process.env.PORT
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

    //AL UNIRSE UNA PERSONA AL SOCKET, SE LE ENVÍA LA INFORMACION DE TODOS LOS RECORRIDOS ACTIVOS
    socket.emit('guidesData', recorridosPorEmpezarSocket);

    //EL GUÍA ENVÍA A TODOS LOS USUARIOS DEL SOCKET, SU UBICACION, Y LA ACTUALIZA EN LA LISTA DEL SOCKET
    socket.on('shareGuideLocation', (data) => {
        recorridosPorEmpezarSocket = recorridosPorEmpezarSocket.map((recorrido)=>{
            if(recorrido.id == data.key){
                recorrido.locationActual = data.coordinates;
            }
                return recorrido;
        })
        socket.broadcast.emit('guideData', data); //Crear en front un socket.on('guideData', (data)=> etc.) que recibe los datos del guia
    });

    //EL GUÍA ENVÍA AL SOCKET LA INFORMACIÓN DE SU RECORRIDO ACTIVADO, JUNTO CON SU UBICACION Y ENVÍA SU UBICACIÓN A TODOS LOS USUARIOS
    socket.on('shareRecorridoActivo', (data) =>{
        const recorrido = {
            usuariosInscriptos: data.usuariosInscriptos,
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

    //EL GUÍA CANCELA EL RECORRIDO, Y ENVÍA A TODOS LOS USUARIOS UNIDOS AL RECORRIDO EL MENSAJE DE CANCELACIÓN, LUEGO QUITA SU RECORRIDO DE LA LISTA
    //Y ENVÍA NUEVAMENTE LA LISTA A LOS USUARIOS SIN SU RECORRIDO
    socket.on('cancelarRecorrido', (data)=>{
        io.to(data.key).emit('cancelarRecorrido');
        socket.leave(data.key);   
        console.log('vieja lista: // ', recorridosPorEmpezarSocket)
        const nuevaLista =  recorridosPorEmpezarSocket.filter((recorrido) => {
           return recorrido.id != data.key;
        });
        recorridosPorEmpezarSocket = nuevaLista;
        
        io.sockets.emit('guidesData', recorridosPorEmpezarSocket);
        
    })

    //EL RECORRIDO INICIA Y ES RETIRADO DE LA LISTA DE RECORRIDOS POR EMPEZAR, FALTA AGREGAR LA ACTUALIZACION DE LA LISTA A LOS USUARIOS
    socket.on('iniciarRecorrido', (data)=>{
        const recorridoEncontrado = recorridosPorEmpezarSocket.find(recorrido => recorrido.id == data.key); 
        recorridosEnCursoSocket.push(recorridoEncontrado);
        const nuevaLista =  recorridosPorEmpezarSocket.filter((recorrido) => {
            return recorrido.id != data.key;
         });
         recorridosPorEmpezarSocket = nuevaLista;
    })
    
    //UN TURISTA SE UNE A UN RECORRIDO DE LA LISTA, Y ENVÍA AL GUÍA LA INFORMACIÓN DE QUE ALGUIEN SE UNIÓ
    socket.on('joinRecorrido', (recorrido) =>{
        console.log('1// join recorridoId: ', recorrido)
        let i = 0;
        let isRecorridoEncontrado = false;
        while(i< recorridosPorEmpezarSocket.length && !isRecorridoEncontrado){
           if(recorridosPorEmpezarSocket[i].id == recorrido){
               isRecorridoEncontrado = true;
           }else{
               i++;
           }
        }
        console.log('2// listaRecorridos en Socket: ', recorridosPorEmpezarSocket)
        if(isRecorridoEncontrado){
            console.log('3// Encontro el recorrido y se unio a la sala')
            recorridosPorEmpezarSocket[i].usuariosInscriptos ++;
            socket.join(recorrido);
        }
        io.to(recorrido).emit('inscripciónUsuario');
    });

    //UN TURISTA ABANDONA UN RECORRIDO DE LA LISTA, Y ENVÍA AL GUÍA LA INFORMACIÓN DE QUE ALGUIEN ABANDONO EL RECORRIDO, LUEGO ABANDONA LA SALA
    socket.on('leaveRecorrido', (recorrido) =>{
        let i = 0;
        let isRecorridoEncontrado = false;
        while(i< recorridosPorEmpezarSocket.length && !isRecorridoEncontrado){
           if(recorridosPorEmpezarSocket[i].id == recorrido){
               isRecorridoEncontrado = true;
           }else{
               i++;
           }
        }

        if(isRecorridoEncontrado){
            recorridosPorEmpezarSocket[i].usuariosInscriptos --;
            io.to(recorrido).emit('abandonoUsuario');
        }
        socket.leave(recorrido);  
    });

    //EL GUÍA ENVÍA LA INFORMACIÓN DEL RECORRIDO A SU SALA, CADA VEZ QUE HAYA UN CAMBIO EN EL RECORRIDO
    socket.on('shareRecorridoDataToRoom', (recorrido) =>{
        console.log('5// recorridoId y room a enviar actualizacion: ', recorrido)
        let i = 0;
        let isRecorridoEncontrado = false;
        while(i< recorridosPorEmpezarSocket.length && !isRecorridoEncontrado){
           if(recorridosPorEmpezarSocket[i].id == recorrido){
               isRecorridoEncontrado = true;
           }else{
               i++;
           }
        }

        if(isRecorridoEncontrado){
            console.log('6// enviando nueva data: ', recorridosPorEmpezarSocket[i])
            io.to(recorrido).emit('recorridoData', (recorridosPorEmpezarSocket[i]));
        }

    })
    
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
});