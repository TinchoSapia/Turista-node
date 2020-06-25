"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RecorridoInstanciaSchema = Schema({
  guiaId: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  recorrido: {
    puntoInicio: {
      latitude: Number,
      longitude: Number,
    },
    recorrido: [
      {
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
        index: Number,
      },
    ],
    maxParticipantes: { type: Number, required: true },
    duracionMinutos: { type: Number, required: true },
    idioma: { type: String, required: true, lowercase: true },
  },
  usuariosInscriptos: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  estado: { type: String, enum: ["Por empezar", "En curso", "Finalizado"] },
  horarioComienzo: Date,

  //fechaComienzo: Date,
});

module.exports = mongoose.model("RecorridoInstancia", RecorridoInstanciaSchema);
