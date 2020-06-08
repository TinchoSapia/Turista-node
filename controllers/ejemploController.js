const User = require('../src/models/user')
const chalk= require('chalk')

function getEjemplos(req, res){
    User.find({}, (err, user) =>{
        if(err)  res.status(500).send({message: `Error al buscar usuarios ${err}`})
        if(!user) res.status(404).send({message: `No hay usuarios registrados`})

        res.status(200).send({user})
    } )
}

function getEjemplo(req, res){
    let userId = req.params.userId
    User.findById(userId, (err, user) =>{
        if(!user) res.status(404).send({message: `Usuario inexistente`})
        if(err)  res.status(500).send({message: `Error al buscar usuarios ${err}`})

        res.status(200).send({user})
    } )
}

function postEjemplo(req, res){
    console.log(chalk.yellow('POST /api/user/'))
    console.log(req.body)

    let user = new User()
    user.name = req.body.name
    user.email = req.body.email
    user.password = req.body.password
    user.role = req.body.role
    

    user.save((err, productStored) => {
        if(err) res.status(500).send({message: `Error al salvar en la base de datos: ${err}`})

        res.status(200).send({user: productStored})
 
    })
}

function updateEjemplo(req, res){
    let userId = req.params.userId;
    let update = req.body

    User.findByIdAndUpdate(userId, update,(err, user)=>{
        if(err) res.status(500).send({message: `Error al actualizar usuario ${err}`})

            res.status(200).send({message: `El usuario ha sido actualizado`})
        
    })
}

function deleteEjemplo(req, res){
    let userId = req.params.userId;

    User.findById(userId, (err, user)=>{
        if(err) res.status(500).send({message: `Error al eliminar usuario ${err}`})

        user.delete(err =>{
            if(err) res.status(500).send({message: `Error al eliminar usuario ${err}`})

            res.status(200).send({message: `El usuario ha sido eliminado`})
        })
    })
}

module.exports ={
    getEjemplo,
    getEjemplos,
    updateEjemplo,
    deleteEjemplo,
    postEjemplo
}