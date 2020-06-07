
const jws = require('jwt')
const moment = require('moment')
const config = require('../config')

function isAuth(req,res,next){
    if (!req.headers.authorization){
        return res.status(403).send({message: 'No tienes autorizacion'})
    }

    const Token = req.headers.authorization.split(" ")[1] // la cabecera tiene 2 partes, la segunda parte es el token ( separados por un espacio " ")
    const payload = jws.decode(Token, config.SECRET_TOKEN)

    if(payload.exp <= moment().unix()){
        return res.status(401).send({message: 'El token ha expirado'})
    }

    req.user = payload.sub
    next()
}

module.exports ={
    isAuth
}