const http = require('http');
const app = require('./app');
require('dotenv').config()

/* définition d'un port si le port 3000 n'est pas libre */
const normalizePort = val => {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
};
const port = normalizePort(process.env.PORT ||  '3000');
app.set('port', port);

// affiche un message d'erreur selon le type d'erreur qui les passé 
const errorHandler = error => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

/* creation du serveur et lancement de l'écoute sur le port définit */
const server = http.createServer(app);

server.on('error', errorHandler);
// affiche un message indiquant le port d'écoute du serveur
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log('Listening on ' + bind);
});

server.listen(port);
