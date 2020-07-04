const RecorridoInstancia = require('../models/recorridoInstancia')
const User = require('../models/user')
const chalk= require('chalk')
const userController = require('./userController')

//OBTENER RECORRIDO PUBLICO
function getRecorridoInstancia(req, res){
    let recorridoInstanciaId = req.params.recorridoInstanciaId; // de la url, recordar agregar al path
    RecorridoInstancia.findById(recorridoInstanciaId, (err, recorrido) =>{
        if(!recorrido){ 
             res.status(404).send({message: `No existe el recorrido`});
             return;
        }
        if(err) {
             res.status(500).send({message: `Error al buscar recorrido ${err}`});
             return;
        }

        return res.status(200).send({recorrido});
    } )
}
async function getRecorridosInstancia(req, res){
    let userId = req.user;
    const user = await User.findById(userId);
    let recorridos = [];
    console.log(user.recorridosFinalizados[0]);
    if(user.recorridosFinalizados.length > 0){
        for(let i = 0; i<user.recorridosFinalizados.length;i++){    
             await RecorridoInstancia.findById(user.recorridosFinalizados[i] , (err, recorridoInstancia) =>{
                if (!err){
                    recorridos.push(recorridoInstancia);
                }
            })
            if (user.recorridosFinalizados.length == recorridos.length){
                return res.status(200).send({recorridos});
                
            }
        }
        
    }else{
        res.status(404).send({message: `No hay recorridos creados`});
        return;
    }

}

//PUBLICAR RECORRIDO (GUIA)
async function postRecorridoInstancia(req, res){

    let userId = req.user;
    const user = await User.findById(userId);
    console.log(req.body.recorrido.recorrido);
    let recorridoInstancia = new RecorridoInstancia({
        guiaId : userId,
        recorrido: {
            nombre: req.body.recorrido.nombre,
            puntoInicio: req.body.recorrido.puntoInicio,
            recorrido: req.body.recorrido.recorrido,
            maxParticipantes: req.body.recorrido.maxParticipantes,
            duracionMinutos: req.body.recorrido.duracionMinutos,
            idioma: req.body.recorrido.idioma,
          },
        estado: 'Por empezar',
        horarioComienzo: req.body.horarioComienzo,
    });
    
    await recorridoInstancia.save(async (err, recorridoInstanciado) => {
        if(err){
             res.status(500).send({message: `Error al salvar en la base de datos: ${err}`,
                                  recorrido: req.body.recorrido});
             return;
        }

        return res.status(200).send({recorrido: recorridoInstanciado})
 
    });
};

//UNIRSE RECORRIDO (TURISTA)
async function unirseRecorridoInstancia(req, res){
   console.log('1 // userId supuestamente: ', req.user);
    let userId = req.user;
    let recorridoInstanciaId = req.params.recorridoId;
    let recorridoInstanciaEncontrado = await RecorridoInstancia.findById(recorridoInstanciaId);
    console.log('2 // recorridoInstanciaID :',recorridoInstanciaId);
    if (recorridoInstanciaEncontrado.recorrido.maxParticipantes <= recorridoInstanciaEncontrado.usuariosInscriptos.length) {
    res.status(403).send({message: `El cupo del recorrido está lleno.` });
         return;
    }

    if (recorridoInstanciaEncontrado.estado !== 'Por empezar') {
        res.status(403).send({message: `Recorrido en curso, o finalizado.` });
             return;
    }
    const nuevaListaUsuarios = [...recorridoInstanciaEncontrado.usuariosInscriptos, userId]
    console.log('3 // nuevaListaUsuarios :',nuevaListaUsuarios);
    RecorridoInstancia.findByIdAndUpdate(recorridoInstanciaId,{"usuariosInscriptos": nuevaListaUsuarios}, function(err, result){

        if(err){
            return res.status(403).send({message: `No se pudo realizar la inscripción`});
        }
        else{
            return res.status(200).send({message: `Inscripción completada con éxito`,
                                            recorrido: result});
        }

    })

}

//ABANDONAR RECORRIDO (TURISTA)
async function abandonarRecorridoInstancia(req, res){
   
    let userId = req.user;
    let recorridoInstanciaId = req.params.recorridoId;
    let recorridoInstanciaEncontrado = await RecorridoInstancia.findById(recorridoInstanciaId);
    
    if (!recorridoInstanciaEncontrado.usuariosInscriptos.includes(userId)) {
    res.status(403).send({message: `No estás inscripto en este recorrido.` });
         return;
    }

    const nuevaListaUsuarios = recorridoInstanciaEncontrado.usuariosInscriptos.filter(id => id !== userId);
    RecorridoInstancia.findByIdAndUpdate(recorridoInstanciaId,{"usuariosInscriptos": nuevaListaUsuarios}, function(err, result){
        if(err){
            return res.status(403).send({message: `No se pudo anular la inscripción`});
        }
        else{
            return res.status(200).send({message: `Inscripción anulada con éxito`});
        }

    })

}

//CANCELAR UN RECORRIDO ACTIVADO (GUIA)
async function cancelarRecorridoInstancia(req, res){
    let userId = req.user;
    let recorridoId = req.params.recorridoId;
    let recorridoEncontrado = await RecorridoInstancia.findById(recorridoId);
    
    if (recorridoEncontrado.guiaId != userId) {
        res.status(403).send({message: `No tienes permiso para modificar este recorrido` });
        return;
    }

    RecorridoInstancia.findById(recorridoId, (err, recorrido)=>{
        if(err) {
          res.status(500).send({message: `Error al eliminar recorrido ${err}`});
          return;
        }
        recorrido.delete(err =>{
            if(err) {
                res.status(500).send({message: `Error al eliminar recorrido ${err}`});
                return;
            }
            return res.status(200).send({message: `El recorrido ha sido eliminado`});
        })
    })
}

//TERMINAR RECORRIDO (GUIA)
async function terminarRecorridoInstancia(req, res){
    let userId = req.user;
    let recorridoId = req.params.recorridoId;
    let recorridoEncontrado = await RecorridoInstancia.findById(recorridoId);
    

    if (recorridoEncontrado.guiaId != userId) {
        res.status(403).send({message: `No tienes permiso para modificar este recorrido` });
        return;
    }

    RecorridoInstancia.findById(recorridoId, (err, recorrido)=>{
        if(err) {
          res.status(500).send({message: `Error al eliminar recorrido ${err}`});
          return;
        }
        recorrido.estado = "Finalizado";
        
        recorrido.save(function(err) {
            if (err){
               return res.status(500).send({message: `Error al finalizar recorrido ${err}`});     
            } 
            for(let i =0;i<recorrido.usuariosInscriptos.size();i++){
                recorrido.usuariosInscriptos.get(i).recorridosFinalizados.add(recorrido)
            }
            return res.status(200).send({message: `El recorrido ha sido finalizado`});
        })
    })
}

//ESTADO EN CURSO RECORRIDO (GUIA)
async function iniciarRecorridoInstancia(req, res){
    let userId = req.user;
    let recorridoId = req.params.recorridoId;
    let recorridoEncontrado = await RecorridoInstancia.findById(recorridoId);
    
    if (recorridoEncontrado.guiaId != userId) {
        res.status(403).send({message: `No tienes permiso para modificar este recorrido` });
        return;
    }

    RecorridoInstancia.findById(recorridoId, (err, recorrido)=>{
        if(err) {
          res.status(500).send({message: `Error al encontrar recorrido ${err}`});
          return;
        }
        recorrido.estado = "En curso";
        recorrido.save(function(err) {
            if (err){
               return res.status(500).send({message: `Error al iniciar recorrido ${err}`});     
            } 
            return res.status(200).send({message: `El recorrido ha iniciado`});
        })
    })
}

module.exports ={
    getRecorridoInstancia,
    postRecorridoInstancia,
    unirseRecorridoInstancia,
    abandonarRecorridoInstancia,
    cancelarRecorridoInstancia,
    terminarRecorridoInstancia,
    iniciarRecorridoInstancia,
    getRecorridosInstancia
    
}