
const service = require('../service/index')

function isAuth(req,res,next){
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
}

module.exports = isAuth