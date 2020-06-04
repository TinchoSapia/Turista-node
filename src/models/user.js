'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs')

const UserSchema = Schema({
    email: { type: String, unique: true, lowercase: true},
    name: String,
    apellido:String,
    password: {type: String, select:false},
    singupDate: {type: Date, default: Date.now()},
    lastLogin: Date,
    role:  { type: String, enum:['Turista','Guia']}

})


UserSchema.pre('save', function(next) {
   let user = this
   if (!user.isModified('password')) return next()

   bcrypt.genSalt(10, (err, salt)=>{
       if(err) return next()

       bcrypt.hash(user.password, salt, null, (err,hash) =>{
           if(err) return next(err)

           user.password = hash
           next()
       })
   })
});

module.exports= mongoose.model('User', UserSchema);