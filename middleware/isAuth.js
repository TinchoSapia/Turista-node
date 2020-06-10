
const service = require('../service/index')

function isAuth(req,res,next){
    if(req.path != '/auth/signup' && req.path != '/auth/signin'){
        if (!req.headers.authorization){
            return res.status(403).send({message: 'No tienes autorizacion'})
        }

        const token = req.headers.authorization.split(' ')[1] // la cabecera tiene 2 partes, la segunda parte es el token ( separados por un espacio " ")
        service.decodeToken(token)
        .then(response=>{
            req.user = response,
            next()
        })
        .catch(response=>{
            res.status(response.status)
        })
        console.log(String(service.decodeToken(token)[1]))
    }else{
    next()
    }
}

module.exports = isAuth