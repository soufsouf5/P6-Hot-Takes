const express = require('express')
const router = express.Router()

const userCtrl = require('../controllers/user')

// route pour l'inscription
router.post('/signup', userCtrl.signup)
// route pour la connexion
router.post('/login', userCtrl.login)

module.exports = router