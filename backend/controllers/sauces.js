const Sauces = require('../models/Sauces');
const fs = require('fs');

/* retourne  un objet sauce correspondant a l'id passé en paramètre */
exports.getOneSauce = (req, res, then) => {
    Sauces.findOne({ _id: req.params.id})
		.then(sauce => res.status(200).json(sauce))
		.catch(error => res.status(404).json({ error }));
};

/* retourne un tableau d'objet sauce */
exports.getAllSauces = (req, res, then) => {
    Sauces.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

/* découpe la chaîne selon les espaces et remplace dans chaque morceau les caractères spéciaux par des underscore */
const replaceCharacter = ( chain ) => {
    partChain = chain.split(' ');
    let recompose = "";
    for (let part in partChain) {
        if (/['\|\/\\\*\+&#"\{\(\[\]\}\)$£€%=\^`]/g.test(partChain[part]) && !(/([a-zA-Z]{1}\'[a-z]{1})/gi.test(partChain[part]))) {
            partChain[part] = partChain[part].replace(/['\|\/\\\*\+&#"\{\(\[\]\}\)$£€%=\^`]/g, '_');
        }
        if (part == (partChain.length - 1 )) {
            recompose += partChain[part]; 
        } else {
            recompose += partChain[part] + ' ';
        }
    }
    return recompose;
}

/* remplacement des caractères spéciaux présent dans les différent champs */
const securitySauce = ( sauce ) => {
    try{
        sauce.name = replaceCharacter(sauce.name);
        sauce.manufacturer = replaceCharacter(sauce.manufacturer);
        sauce.description = replaceCharacter(sauce.description);
        sauce.mainPepper = replaceCharacter(sauce.mainPepper);
        return sauce;
    } catch (error) {
        res.status(401).json({ error });
        return 0;
    }
}

/* Enregistre dans la BDD la sauce que l'utilisateur a créer */
exports.createSauce = (req, res, then) => {
    var sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;

    /* remplacement des caractères spéciaux présent dans les différent champs */
    if(!securitySauce(sauceObject)) { return; };

    //copie les valeurs entré par l'utilisateur dans un nouvel objet sauce
    const sauce = new Sauces({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    // enregistre la sauce dans la BDD et retourne un message en cas de succès ou une erreur en cas d'échec
    sauce.save()
        .then(() => res.status(201).json({message: 'Sauce enregistré !'}))
        .catch(error => res.status(400).json({ error }));

};

/* modifie la sauce dont l'id est passé en paramètre */
exports.modifySauce = (req, res, then) => {
    // teste si un fichier à été ajouté à la requête
    const sauceObject = req.file ? 
    { 
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    /* remplacement des caractères spéciaux présent dans les différent champs */
    if(!securitySauce(sauceObject)) { return; };
    /* supprime l'ancienne image de la sauce si une nouvelle est fournis */
    if (req.file) {
        // recherche dans la BDD la sauce dont l'id à été fournis
        Sauces.findOne({ _id: req.params.id })
		.then( sauce => {
            // récupère le chemin de l'image et la supprime des dossiers du serveur
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, (err) => {
                if (err) {
                    //message d'erreur si la suppression n'a pu être faite
                    console.log("failed to delete local image:"+err);
                }
            });
        })
        // message d'erreur si la récupération de la sauce n'a pu être faite
        .catch(error => res.status(500).json({ error }));
    }
    // met à jour la sauce et retourne un message d'erreur le cas échéant
    Sauces.updateOne({_id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifié !'}))
        .catch(error => res.status(400).json({ error }));
};

/* supprime la sauce dont l'id est en paramètre */
exports.deleteSauce = (req, res, then) => {
    //recherche la sauce dans la BDD
    Sauces.findOne({ _id: req.params.id})
		.then( sauce => {
            //récupère le chemin physique de l'image
            const filename = sauce.imageUrl.split('/images/')[1];
            // supprime l'image des dossiers du serveur
            fs.unlink(`images/${filename}`, () => {
                // supprime la sauce de la BDD et retourne un message le confirmant
                Sauces.deleteOne({_id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        // erreur si la sauce n'a pu être recherché
        .catch(error => res.status(500).json({ error }));
};

/* gère les likes et dislike */
exports.likeSauce = (req, res, then) => {
    // recherche la sauce dans la BDD
    Sauces.findOne({ _id: req.params.id})
		.then( sauce => {
            // selon la valeur du like, un bloc de code différent sera exécuté
            switch (req.body.like) {
                case -1:
                    /* n'aime pas : on incrémente les dislikes et on ajoute le userId au array usersDisliked*/
                    sauce.dislikes++;
                    // ajoute l'id de l'utilisateur au tableur des userDisliked
                    sauce.usersDisliked.push(req.body.userId);
                    // si l'id de l'utilisateur été déjà présent dans le tableau userLiked
                    // on décrémente les likes et on le retire du tableau
                    if (sauce.usersLiked.includes(req.body.userId)) {
                        sauce.likes--;
                        let index = sauce.usersLiked.indexOf(req.body.userId);
                        sauce.usersLiked.splice(index, 1);
                    }
                    break;
                case 0:
                    /* annule le vote : supprime le userId du array ou il se trouve et décrémente le 
                    likes ou dislikes selon la présence ou non de l'id dans le array*/
                    if (sauce.usersLiked.includes(req.body.userId)) {
                        sauce.likes--;
                        let index = sauce.usersLiked.indexOf(req.body.userId);
                        sauce.usersLiked.splice(index, 1);
                    } else if (sauce.usersDisliked.includes(req.body.userId)) {
                        sauce.dislikes--;
                        let index = sauce.usersDisliked.indexOf(req.body.userId);
                        sauce.usersDisliked.splice(index, 1);
                    }
                    break;
                case 1:
                    /* aime : incrémente les likes et ajoute le userId au array usersLiked*/
                    sauce.likes++;
                    //ajoute l'id de l'utilisateur dans le tableau userLiked
                    sauce.usersLiked.push(req.body.userId);
                    // si l'id de l'utilisateur été déjà présent dans le tableau userDisliked
                    // on décrémente les dislikes et on le retire du tableau
                    if (sauce.usersDisliked.includes(req.body.userId)) {
                        sauce.dislikes--;
                        let index = sauce.usersDisliked.indexOf(req.body.userId);
                        sauce.usersDisliked.splice(index, 1);
                    }
                    break;
                default:
                    // Si la valeur de like passé en paramètre n'entre pas dans les 3 cas précèdent
                    // un message d'erreur est retourné
                    res.status(404).json({ message: "Error : unknown like type !" });
                    return;
                    break;
            }
            // met à jour la BDD avec les valeurs modifiés précédemment 
            Sauces.updateOne({_id: req.params.id }, { 
                likes: sauce.likes, 
                dislikes: sauce.dislikes, 
                usersLiked: sauce.usersLiked,
                usersDisliked: sauce.usersDisliked,
                _id: req.params.id })
                .then(() => {
                    // retourne un message confirmant la mise à jour
                    res.status(200).json({ message: 'Like de la sauce modifié !'});
                    })
                .catch(error => {
                    // message d'erreur si la sauce n'a pu être mise à jour
                    res.status(400).json({ error });
                });
        })
        // message d'erreur si la sauce n'a pu être recherché
		.catch(error => {
            res.status(404).json({ error });
        });
}