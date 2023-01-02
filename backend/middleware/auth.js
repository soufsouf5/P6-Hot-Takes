const jwt = require('jsonwebtoken')

// vérifie le token envoyé par le navigateur de l'utilisateur à chaque requête
module.exports = (req, res, next ) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decodedToken = jwt.verify(token, 'c19cf0ee354dee5163bf6b19f0a52cca1892ee15aa5acddd4df33d6a48d62075')
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