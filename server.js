const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Un nuevo cliente se ha conectado');

    socket.on('draw', (data) => {
        socket.broadcast.emit('draw', data);
    });

    socket.on('clear', () => {
        socket.broadcast.emit('clear');
    });

    socket.on('colorChange', (color) => {
        socket.broadcast.emit('colorChange', color);
    });

    socket.on('imageUpload', (imgData) => {
        socket.broadcast.emit('imageUpload', imgData);
    });

    socket.on('backgroundChange', (selectedColor) => {
        console.log(`Color de fondo recibido: ${selectedColor}`);
        socket.broadcast.emit('backgroundChange', selectedColor);
    });

    socket.on('disconnect', () => {
        console.log('Un cliente se ha desconectado');
    });
});

server.listen(8080, () => {
    console.log('Servidor escuchando en http://localhost:8080');
});
