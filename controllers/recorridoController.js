const Recorrido = require('../models/recorrido')
const User = require('../models/user')
const chalk= require('chalk')


function getRecorridos(req, res){
    let userId = req.user;
    console.log(userId);
    Recorrido.find({ creadorId: userId }, (err, recorridos) =>{
        if(!recorridos) {
            res.status(404).send({message: `No hay recorridos creados`});
            return;
        }
        if(err) {
            res.status(500).send({message: `Error al buscar recorridos ${err}`});
            return
        } 

        return res.status(200).send({recorridos});
    } )
}

function getRecorrido(req, res){
    let userId = req.user;
    let recorridoId = req.params.recorridoId; // de la url, recordar agregar al path
    Recorrido.findById(recorridoId, (err, recorrido) =>{
        if(!recorridos){ 
             res.status(404).send({message: `No existe el recorrido`});
             return;
        }
        if(err) {
             res.status(500).send({message: `Error al buscar recorrido ${err}`});
             return;
        }
        // si el creador del recorrido no es el mismo que lo pide, no devolver
        if(recorrido.creadorId !== userId){
             res.status(403).send({message: `No tienes permiso para acceder a este recorrido` });
             return;
        }

        return res.status(200).send({recorrido});
    } )
}

async function postRecorrido(req, res){

    let userId = req.user;
    const user = await User.findById(userId);
    
    let recorrido = new Recorrido({
        creadorId : userId,
        nombre: req.body.nombreRecorrido,
        puntoInicio : req.body.puntoInicio,
        recorrido : req.body.recorrido,
        maxParticipantes : req.body.maxParticipantes,
        duracionMinutos : req.body.duracionMinutos,
        idioma : req.body.idioma,
    })
    
    await recorrido.save(async (err, recorridoCreado) => {
        if(err){
             res.status(500).send({message: `Error al salvar en la base de datos: ${err}`});
             return;
        }
        //guardar la referencia del recorrido dentro del usuario
        await user.recorridos.push(recorridoCreado._id);
        await user.save();


        return res.status(200).send({recorrido: recorridoCreado})
 
    })
}

async function updateRecorrido(req, res){
    let userId = req.user;
    let recorridoId = req.params.recorridoId;
    let update = req.body
    let recorridoEncontrado = await Recorrido.findById(recorridoId);
    
    if (recorridoEncontrado.creadorId != userId) {
         res.status(403).send({message: `No tienes permiso para modificar este recorrido` });
         return;
    }
    Recorrido.findByIdAndUpdate(recorridoId, update,(err, user)=>{
        if(err) {
            res.status(500).send({message: `Error al actualizar recorrido ${err}`})
            return;
        }
        return res.status(200).send({message: `El recorrido ha sido actualizado`});
        
    })
}


async function deleteRecorrido(req, res){
    let userId = req.user;
    let recorridoId = req.params.recorridoId;
    let recorridoEncontrado = await Recorrido.findById(recorridoId);
    if (recorridoEncontrado.creadorId != userId) {
        res.status(403).send({message: `No tienes permiso para modificar este recorrido` });
        return;
    }

    Recorrido.findById(recorridoId, (err, recorrido)=>{
        if(err) {
          res.status(500).send({message: `Error al eliminar recorrido ${err}`});
          return;
        }
        console.log(recorrido)
        recorrido.delete(err =>{
            if(err) {
                res.status(500).send({message: `Error al eliminar recorrido ${err}`});
                return;
            }
            //busca el usuario, y elimina el recorrido de su lista de recorridos
            User.findByIdAndUpdate(userId, 
                { $pullAll: { recorridos: [recorridoId] } }, 
                { new: true }, 
                function(err, data) {
                    console.log(data);
                } 
            );

            return res.status(200).send({message: `El recorrido ha sido eliminado`});
        })
    })
}

module.exports ={
    getRecorrido,
    getRecorridos,
    updateRecorrido,
    deleteRecorrido,
    postRecorrido
}