'use strict'

const chalk = require('chalk')
const mongoose = require('mongoose');
const app = require('./app')

const config = require('./config')



mongoose.connect(config.db, {useNewUrlParser:true, useUnifiedTopology:true}, (err,res) =>{
    if(err) {
        return console.log(chalk.red(`Error al intentar conectarse a la base de datos - ${err}`))
    }
    console.log(chalk.green('Base de datos conectada..'))

    app.listen(config.port, () => {
        console.log(chalk.blue(`Corriendo en puerto: ${config.port}`))
    });
});
