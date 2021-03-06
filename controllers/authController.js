
const mongoose = require('mongoose')
const User = require('../models/user')
const chalk = require('chalk')
const service = require('../service/index')
const bcrypt = require('bcrypt-nodejs')

function signUp(req, res){
    const user = new User({
        email: req.body.email,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        role: req.body.role,
        password: req.body.password,
        fechaDeNacimiento: req.body.fechaDeNacimiento,
        genero: req.body.genero,
        celular: req.body.celular
    })
    user.save((err)=>{
        if (err) {
            return res.status(500).send({message: `Error al salvar el usuario ${err}`});
        }
        return res.status(200).send({token: service.createToken(user)})
    })
}

function signIn(req, res){
    User.findOne({email: req.body.email}, function(err,user){
        if(err) {
            return res.status(500).send({message: err});
        }
        if(!user) {
            return res.status(404).send({message: `Usuario no encontrado`});
        }
        let userdata = user;
        console.log(chalk.red(user))
        bcrypt.compare(req.body.password, userdata.password, function (err, result) {
            console.log(chalk.bgRed(String(userdata.password)))
            if (result == true) {
                user.lastLogin = Date.now()
                return res.status(200).json({
                message: `Te has logeado correctamente`,
                token: service.createToken(user),
                role: user.role,
                nombre: user.nombre +' '+ user.apellido,
                //localStorage: setItem('token', user.token)
        
              });
                //res.redirect('/home');
            } else {
                return res.status(403).send('Password Incorrecta');
             //res.redirect('/');
            }
          });     
    })
}

module.exports = {
    signUp,
    signIn
}