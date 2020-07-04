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
    server.listen(process.env.PORT || process.env.ALT_PORT, () => {
        console.log(chalk.blue(`Corriendo en puerto: ${process.env.ALT_PORT}`))
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
        const nuevaLista =  recorridosPorEmpezarSocket.filter((recorrido) => {
           return recorrido.id != data.key;
        });
        recorridosPorEmpezarSocket = nuevaLista;
        
        io.sockets.emit('guidesData', recorridosPorEmpezarSocket);
        
    })

    //EL RECORRIDO INICIA Y ES RETIRADO DE LA LISTA DE RECORRIDOS POR EMPEZAR, FALTA AGREGAR LA ACTUALIZACION DE LA LISTA A LOS USUARIOS
    socket.on('iniciarRecorrido', (data)=>{
        const recorridoEncontrado = recorridosPorEmpezarSocket.filter((recorrido) => {
            return recorrido.id == data.key;
        });
         console.log('ESTA FUNCIONANDO?', recorridoEncontrado)    
         recorridoEncontrado.locationTuristas = [];          
        recorridosEnCursoSocket.push(recorridoEncontrado);

        const nuevaLista =  recorridosPorEmpezarSocket.filter((recorrido) => {
            return recorrido.id != data.key;
         });
         recorridosPorEmpezarSocket = nuevaLista;
         io.sockets.emit('guidesData', recorridosPorEmpezarSocket);
         io.to(data.key).emit('iniciarRecorrido');
    })
    
    //UN TURISTA SE UNE A UN RECORRIDO DE LA LISTA, Y ENVÍA AL GUÍA LA INFORMACIÓN DE QUE ALGUIEN SE UNIÓ
    socket.on('joinRecorrido', (recorrido) =>{
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
            recorridosPorEmpezarSocket[i].usuariosInscriptos = recorridosPorEmpezarSocket[i].usuariosInscriptos +1;
            socket.join(recorrido);
            io.to(recorrido).emit('inscripciónUsuario', recorridosPorEmpezarSocket[i].usuariosInscriptos);
        }
        
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
        console.log('1//recorridoId a abandonar: ', recorrido)
        if(isRecorridoEncontrado){
            console.log('3//recorrido encontrado, cant anterior:', recorridosPorEmpezarSocket[i].usuariosInscriptos)
            recorridosPorEmpezarSocket[i].usuariosInscriptos = recorridosPorEmpezarSocket[i].usuariosInscriptos -1;
            console.log('2//recorrido encontrado, cant nueva: ', recorridosPorEmpezarSocket[i].usuariosInscriptos)
            io.to(recorrido).emit('abandonoUsuario', recorridosPorEmpezarSocket[i].usuariosInscriptos);
            socket.leave(recorrido);
        }
         
    });

    //EL GUÍA ENVÍA LA INFORMACIÓN DEL RECORRIDO A SU SALA, CADA VEZ QUE HAYA UN CAMBIO EN EL RECORRIDO
    socket.on('shareRecorridoDataToRoom', (recorrido) =>{
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
            io.to(recorrido).emit('recorridoData', (recorridosPorEmpezarSocket[i]));
        }
    })
    
    socket.on('shareGuideLocationGrupo', (location)=>{
            console.log('//ENTRO GUIA AL SOCKET//', location)
            socket.join(location.key);
            let i = 0;
            let isRecorridoEncontrado = false;
            console.log('//LISTA DE RECORRIDOS EN CURSO// ',recorridosEnCursoSocket)
            while(i< recorridosEnCursoSocket.length && !isRecorridoEncontrado){
               if(recorridosEnCursoSocket[i][0].id == location.key){
                   isRecorridoEncontrado = true;
               }else{
                   i++;
               }
            }
            const recorridoEncontrado = recorridosEnCursoSocket[i];
            console.log('//RECORRIDO ENCONTRADO// ', recorridoEncontrado); 
            if(isRecorridoEncontrado){
                
                console.log('//GUIA GUARDO EN EL SOCKET SU LOCATION//', location)
                recorridosEnCursoSocket[i][0].locationActual = location;
            }
            if(recorridosEnCursoSocket[i].locationTuristas){
                for (let num = 0; num < recorridoEncontrado[1].length; i++){
                    console.log('//SE LE ENVIAN AL GUIA TODAS LAS LOCATION DE TURISTAS GUARDADAS EN EL SOCKET', num, recorridoEncontrado[1][num])
                    io.to(location.key).emit('turistaLocation', recorridoEncontrado[1][num] )
                }
            }
            
            console.log('//GUIA MANDA UBICACION AL ROOM//')
            io.to(location.key).emit('guiaLocation', location)
        
        
    })
    socket.on('shareTuristaLocationGrupo', (location)=>{
            
            console.log('//ENTRO TURISTA AL SOCKET//', location)
            socket.join(location.key);
            let i = 0;
            let isRecorridoEncontrado = false;
            console.log('//LISTA DE RECORRIDOS EN CURSO// ',recorridosEnCursoSocket)
            while(i< recorridosEnCursoSocket.length && !isRecorridoEncontrado){
               if(recorridosEnCursoSocket[i][0].id == location.key){
                   isRecorridoEncontrado = true;
               }else{
                   i++;
               }
            }
            if(isRecorridoEncontrado){
                
                console.log('//TURISTA GUARDA EN EL SOCKET SU UBICACION//')
                if(recorridosEnCursoSocket[i].locationTuristas.length > 0){
                    recorridosEnCursoSocket[i].locationTuristas = recorridosEnCursoSocket[i].locationTuristas.filter((tempLocation)=>{
                        return tempLocation.nombre != location.nombre;
                    })
                    recorridosEnCursoSocket[i].locationTuristas.push(location);
                }else{
                    recorridosEnCursoSocket[i].locationTuristas.push(location);
                }
            }
            
            console.log('//TURISTA ENVIA SU UBICACION AL ROOM//')
            io.to(location.key).emit('locationTurista', location)
        
    })

    socket.on('updateLocationsTuristas', (locations)=>{
        let i = 0;
        let isRecorridoEncontrado = false;
        while(i< recorridosEnCursoSocket.length && !isRecorridoEncontrado){
            if(recorridosEnCursoSocket[i][0].id == location.key){
                isRecorridoEncontrado = true;
            }else{
                i++;
            }
         }
         if(isRecorridoEncontrado){
            
            console.log('//GUIA ENVIA SU UBICACION AL GRUPO DE NUEVO DESDE UPDATE LOCATIONS//', location)
            io.to(locations.key).emit('guiaLocation', recorridosEnCursoSocket[i].locationActual)
           
         }
         console.log('//GUIA ENVIA LA UBICACION AL GRUPO DE TODOS LOS TURISTAS//', locations)
         io.to(locations.key).emit('locationsTuristas', locations);
       
    })

    socket.on('finalizarRecorrido', (data)=>{
        io.to(data.key).emit('finRecorrido');
    })

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
});