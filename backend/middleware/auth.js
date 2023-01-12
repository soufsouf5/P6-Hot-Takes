const jwt = require('jsonwebtoken')

// vérifie le token envoyé par le navigateur de l'utilisateur à chaque requête
module.exports = (req, res, next ) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET')
        const userId = decodedToken.userId
        if (req.body.userId && req.body.userId !== userId) {
            throw 'User ID invalide !'
        } else {
            next()
        }
    } catch (error) {
        res.status(401).json({ error: error | 'Requête non authentifiée !'})
    }
}