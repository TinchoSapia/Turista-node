'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = Schema({
    email: { type: String, _id: true},
    contrasenia: String,
    role:  { type: String, enum:['Turista','Guia']}

})

module.exports= mongoose.model('User', UserSchema);