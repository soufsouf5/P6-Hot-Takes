const express = require('express');
const router = express.Router();

const saucesCtrl = require('../controllers/sauces');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');


/* retourne une sauce */
router.get('/:id', auth, saucesCtrl.getOneSauce);
/* retourne toutes les sauces */
router.get('/', auth, saucesCtrl.getAllSauces);
/* enregistre la sauce reçu dans la BDD */
router.post('/', auth, multer, saucesCtrl.createSauce);
/* met a jour la sauce image et ou contenu */
router.put('/:id', auth, multer, saucesCtrl.modifySauce);
/*supprime la sauce */
router.delete('/:id', auth, saucesCtrl.deleteSauce);

/* aime ou pas la sauce */
router.post('/:id/like', auth, saucesCtrl.likeSauce);

module.exports = router;