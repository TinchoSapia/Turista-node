'use strict'

const express = require('express')
const router = express.Router()
const auth = require('../middleware/isAuth')
const authController = require('../controllers/authController')

router.post('/signup/', authController.signUp)
router.post('/signin/', authController.signIn)
router.get('/private', auth, (req,res)=>{
    res.status(200).send('Tienes Acceso')
})
module.exports = router;