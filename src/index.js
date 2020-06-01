'use strict'
const express = require('express');
const chalk = require('chalk')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('../src/models/user.js')

const app = express();
const port = process.env.PORT || 3000;
const uriDb= 'mongodb+srv://admin:admin@cluster0-omvhf.mongodb.net/test?retryWrites=true&w=majority'

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

mongoose.connect(uriDb, {useNewUrlParser:true, useUnifiedTopology:true}, (err,res) =>{
    if(err) {
        return console.log(chalk.red(`Error al intentar conectarse a la base de datos - ${err}`))
    }
    console.log(chalk.green('Base de datos conectada..'))

    app.listen(port, () => {
        console.log(chalk.blue(`Corriendo en puerto: ${port}`))
    });
});


app.get('/api/user/:userId', (req,res) => {
    res.send(200, )    
});

app.get('/api/user/', (req,res) => {
    res.send(200, {user: []})    
});

app.post('/api/user/', (req,res) =>{
    console.log(chalk.yellow('POST /api/user/'))
    console.log(req.body)

    let user = new User()
    user.email = req.body.email
    user.contrasenia = req.body.contrasenia
    user.role = req.body.role
    

    user.save((err, productStored) => {
        if(err) res.status(500).send({message: `Error al salvar en la base de datos: ${err}`})

        res.status(200).send({user: productStored})
 
    })
});
app.put('/api/user/:userId', (req,res) =>{
    
});
app.delete('/api/user/:userId', (req,res) =>{
    
});
