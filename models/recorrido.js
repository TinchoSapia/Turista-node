const mongoose = require('mongoose');
const Schema = mongoose.Schema;


/*//geoJSON multipoint schema, longitude viene PRIMERO en un array de coordenadas GeoJSON, NO latitude. (alreves)
const multiPointSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['MultiPoint'],
      required: true
    },
    coordinates: {
      type: [[Number]],
      required: true
    }
  });

const pointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
})
*/
const recorridoSchema = Schema({
    creadorId: { type: Schema.Types.ObjectId, ref:'user'},
    puntoInicio: {
                  latitude: Number,
                  longitude: Number,
                },
    recorrido: [{ coordinates: {
                                latitude: Number,
                                longitude: Number,
                                },
                  index: Number,
               }],
    maxParticipantes: { type: Number, required: true, },
    duracionMinutos: { type: Number, required: true },
    idioma: { type: String, required: true, lowercase: true },
    
});


module.exports = mongoose.model('Recorrido', recorridoSchema);