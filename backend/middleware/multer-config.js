const multer = require('multer')

const MINE_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}

// transforme le chemin du fichier en url valide
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        var name = file.originalname.split(' ').join('_')
        if (name.includes('.jpg') || name.includes('.png')) {
            name = name.slice(0,-4)
        } else if ( name.includes('.jpeg')) {
            name = name.slice(0,-5)
        }
        const extension = MINE_TYPES[file.mimetype]
        callback(null, name + Date.now() + '.' + extension)
    }
})

module.exports = multer({ storage }).single('image')