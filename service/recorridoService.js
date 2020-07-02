const RecorridoInstancia = require('../models/recorridoInstancia')

//OBTENER TODOS LOS RECORRIDOS ACTIVOS
function getRecorridosActivos(){
    const recorridosActivos = RecorridoInstancia.find({}, (err, recorridos) =>{
        if(!recorridos){ 
            return null;
        }
        if(err) {
            console.log(`Error al buscar recorrido ${err}`);
             return;
        }
        console.log(recorridos);
        return recorridos;
    } )
    return recorridosActivos;
}


module.exports = {
    getRecorridosActivos,
}