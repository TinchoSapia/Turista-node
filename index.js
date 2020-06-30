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

//io listener
const recorridosActivos = [];
io.on('connection', (socket) => {

    socket.on('shareGuideLocation', (data) => {
        socket.broadcast.emit('guideData', data); //Crear en front un socket.on('guideData', (data)=> etc.) que recibe los datos del guia
    });

    socket.on('shareRecorridoActivo', (data) =>{
        let recorrido = {
            recorrido: data.recorrido,
            id: data.key,
        }
        recorridosActivos.push(recorrido)
        socket.join(data.key); 
        let location = {
            key: data.key,
            coordinates: data.coordinates,
        }
        socket.broadcast.emit('guideData', location)
    });
    
    socket.on('joinRecorrido', (recorrido) =>{
        socket.join(recorrido);  
    });
    
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
});


//database connection + server listening
mongoose.connect(process.env.DB, {useNewUrlParser:true, useUnifiedTopology:true}, (err,res) =>{
    if(err) {
        return console.log(chalk.red(`Error al intentar conectarse a la base de datos - ${err}`))
    }
    console.log(chalk.green('Base de datos conectada..'))

    server.listen(process.env.PORT || process.env.ALT_PORT, () => {
        console.log(chalk.blue(`Corriendo en puerto: ${process.env.ALT_PORT}`))
    });
});