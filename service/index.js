
const jwt = require('jwt-simple')
const moment = require('moment')

function createToken(user){
    const payload ={
        sub: user._id,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(14,'days').unix(),
    }
   return jwt.encode(payload, process.env.SECRET_TOKEN)
}

function decodeToken(token){

    const decode = new Promise((resolve, reject) =>{
        try{
            const payload = jwt.decode(token, process.env.SECRET_TOKEN)
            if(payload.exp <= moment().unix()){
               reject({
                   status: 401,
                   message: 'El token ha expirado'
               })
            }

            resolve(payload.sub)
        
        }catch(err){
            reject({
                status:500,
                message: `Invalid Token`
            })

        }
    })
    return decode
}

module.exports = {
    createToken,
    decodeToken
}