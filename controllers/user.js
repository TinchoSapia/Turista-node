
const mongoose = require('mongoose')
const User = require('../src/models/user')
const service = require('../service/index')

function singUp(req, res){
    const user = new User({
        email: req.body.email,
        name: req.body.name,
        apellido: req.body.apellido,
        role: req.body.role

    })
    user.save((err)=>{
        if (err) res.status(500).send({message: `Error al salvar el usuario ${err}`})

        return res.status(200).send({token: service.createToken(user)})
    })
}

function singIn(req, res){
    
}
module.exports = {
    singUp,
    singIn
}