const express = require('express')
const router = express.Router()

const saucesCtrl = require('../controllers/sauces')
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')


// permet de trouver une sauce
router.get('/:id', auth, saucesCtrl.getOneSauce)
// permet de trouver toutes les sauces
router.get('/', auth, saucesCtrl.getAllSauces)
// enregistre une sauce dans la base de données 
router.post('/', auth, multer, saucesCtrl.createSauce)
// met a jour le contenu et ou l'image de la sauce
router.put('/:id', auth, multer, saucesCtrl.modifySauce)
// suppression de la sauce
router.delete('/:id', auth, saucesCtrl.deleteSauce)

// permet de like la sauce
router.post('/:id/like', auth, saucesCtrl.likeSauce)

module.exports = router