
const mongoose = require('mongoose')
const User = require('../src/models/user')
const service = require('../service/index')

function singUp(req, res){
    const user = new User({
        email: req.body.email,
        name: req.body.name,
        apellido: req.body.apellido,
        role: req.body.role,
        password: req.body.password

    })
    user.save((err)=>{
        if (err) res.status(500).send({message: `Error al salvar el usuario ${err}`})

        return res.status(200).send({token: service.createToken(user)})
    })
}

function singIn(req, res){
    User.find({email: req.body.email},(err,user)=>{
        if(err) res.status(500).send({message: err})
        if(!user) res.status(404).send({message: `Usuario no encontrado`})
        
        req.user = user
        res.status(200).send({
            message: `Te has logeado correctamente`,
            Token: service.createToken(user)
        })
    })
}

module.exports = {
    singUp,
    singIn
}