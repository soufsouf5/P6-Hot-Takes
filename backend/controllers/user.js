const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
var REGEX_EMAIL = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;


/* inscrit l'utilisateur si son email n'est pas déjà utilisé */
exports.signup = (req, res, then) => {
    // vérifie si l'email est bien formé et/ou si le mot de passe fait plus de 4 caractères
    if (REGEX_EMAIL.test(String(req.body.email).toLowerCase()) && req.body.password.length > 4) {
        // Vérifie si l'utilisateur existe déjà
        User.findOne({ email: req.body.email })
        .then(user => {
            if(!user) {
                //  sécurise le mot de passe en le hachant
                bcrypt.hash(req.body.password, 10)
                .then(hash => {
                    // crée une instance du model User, y insert les données et les sauvegardes 
                    // dans la base de données.
                    var user = new User({
                        email: req.body.email,
                        password: hash
                    });
                    user.save()
                    .then(() => {
                        // message retourné en cas de réussite
                        res.status(201).json({ message: 'Utilisateur créé !'})
                    })
                    .catch(error => {
                        // message d'erreur retourné en cas d'échec de l'ajout des données dans la BDD 
                        res.status(500).json({ error });
                    });
                })
                // message d'erreur en cas d'échec de hachage du mot de passe
                .catch(error => res.status(500).json({ error }));
            } else {
                // message d'erreur si l'utilisateur à été trouvé dans la BDD
                return res.status(401).json({ message: 'Action non autorisée !'});
            }
            
        })
        // message d'erreur si la présence de l'utilisateur dans la BDD n'a pu être vérifié
        .catch(error => res.status(500).json({ error }));
    } else {
        //message d'erreur si l'email est mal formé ou/et si le mot de passe est trop court
        res.status(401).json({ message: 'Action non autorisée !'});
    }
};

/* connecte un utilisateur grace a son email et son mot de passe et retourne un token*/
exports.login = (req, res, then) => {
    //vérifie si l'email est bien formé et le mot de passe fait plus de 4 caractères
    if (REGEX_EMAIL.test(String(req.body.email).toLowerCase()) && req.body.password.length > 4) {
        // vérifie si un utilisateur ayant cet email est présent de la BDD
        User.findOne({ email: req.body.email.toLowerCase() })
        .then(user => {
            if(!user) {
                // message d'erreur si l'utilisateur n'a pas été trouvé
                return res.status(401).json({ error: 'Utilisateur non trouvé !'});
            }
            // compare le hash récupérer de la BDD avec le mot de passe reçu dans la requête
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        // message d'erreur si le mot de pass et le hash ne corresponde pas
                        return res.status(401).json({ error: 'Mot de passe incorrect !'});
                    }
                    // répond à la requête par un objet JSON contenant l'id de l'utilisateur
                    // et un token valide 24h généré a partir de l'id  et d'un hash
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'c19cf0ee354dee5163bf6b19f0a52cca1892ee15aa5acddd4df33d6a48d62075',
                            { expiresIn: '24h' }
                        )
                    });
                })
                // message d'erreur si la comparaison n'à pu être éffectué
                .catch(error => res.status(500).json({ error }));
        })
        // message d'erreur si la présence de l'utilisateur dans la BDD n'a pu être vérifié
        .catch(error => res.status(500).json({ error }));
    } else {
        //message d'erreur si l'email est mal formé ou/et si le mot de passe est trop court
        res.status(401).json({ message: 'Action non autorisée !'});
    }
};