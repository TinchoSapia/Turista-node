const RecorridoInstancia = require('../models/recorridoInstancia')
const User = require('../models/user')
const chalk= require('chalk')

//OBTENER RECORRIDO PUBLICO
function getRecorridoInstancia(req, res){
    let recorridoInstanciaId = req.params.recorridoInstanciaId; // de la url, recordar agregar al path
    RecorridoInstancia.findById(recorridoInstanciaId, (err, recorrido) =>{
        if(!recorridos){ 
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

//PUBLICAR RECORRIDO (GUIA)
async function postRecorridoInstancia(req, res){

    let userId = req.user;
    const user = await User.findById(userId);
    
    let recorridoInstancia = new RecorridoInstancia({
        guiaId : userId,
        recorrido: req.body.recorrido,
        estado: 'Por empezar',
        horarioComienzo: req.body.horarioComienzo,
    });
    
    await recorridoInstancia.save(async (err, recorridoInstanciado) => {
        if(err){
             res.status(500).send({message: `Error al salvar en la base de datos: ${err}`});
             return;
        }

        return res.status(200).send({recorrido: recorridoInstanciado})
 
    });
};

//UNIRSE RECORRIDO (TURISTA)
async function unirseRecorridoInstancia(req, res){
   
    let userId = req.user;
    let recorridoInstanciaId = req.params.recorridoInstanciaId;
    let recorridoInstanciaEncontrado = await RecorridoInstancia.findById(recorridoInstanciaId);
    
    if (recorridoInstanciaEncontrado.recorrido.maxParticipantes <= recorridoInstanciaEncontrado.usuariosInscriptos.length) {
    res.status(403).send({message: `El cupo del recorrido está lleno.` });
         return;
    }

    if (recorridoInstanciaEncontrado.estado !== 'Por empezar') {
        res.status(403).send({message: `Recorrido en curso, o finalizado.` });
             return;
    }

    await recorridoInstanciaEncontrado.usuariosInscriptos.push(userId);
    await recorridoInstanciaEncontrado.save();

    if (recorridoInstanciaEncontrado.usuariosInscriptos.includes(userId)){
        return res.status(200).send({message: `Inscripción completada con éxito`});
    } else {
        return res.status(403).send({message: `No se pudo realizar la inscripción`});
    }

}

//ABANDONAR RECORRIDO (TURISTA)
async function abandonarRecorridoInstancia(req, res){
   
    let userId = req.user;
    let recorridoInstanciaId = req.params.recorridoInstanciaId;
    let recorridoInstanciaEncontrado = await RecorridoInstancia.findById(recorridoInstanciaId);
    
    if (!recorridoInstanciaEncontrado.usuariosInscriptos.includes(userId)) {
    res.status(403).send({message: `No estás inscripto en este recorrido.` });
         return;
    }

    recorridoInstanciaEncontrado = await recorridoInstanciaEncontrado.usuariosInscriptos.filter(id => id !== userId);
    await recorridoInstanciaEncontrado.save();

    if (!recorridoInstanciaEncontrado.usuariosInscriptos.includes(userId)){
        return res.status(200).send({message: `Inscripción anulada con éxito`});
    } else {
        return res.status(403).send({message: `No se pudo anular la inscripción`});
    }

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
            return res.status(200).send({message: `El recorrido ha sido finalizado`});
        })
    })
}

module.exports ={
    getRecorridoInstancia,
    postRecorridoInstancia,
    unirseRecorridoInstancia,
    abandonarRecorridoInstancia,
    cancelarRecorridoInstancia,
    terminarRecorridoInstancia
}