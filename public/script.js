const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let painting = false;
let startX, startY; // Para almacenar la posición de inicio del mouse
let isFilling = false; // Para saber si estamos en modo de rellenar

const socket = io();
let currentColor = '#000000';

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

function startPosition(e) {
    if (isFilling) {
        startX = e.clientX - canvas.getBoundingClientRect().left;
        startY = e.clientY - canvas.getBoundingClientRect().top;
    } else {
        painting = true;
        draw(e);
    }
}

function endPosition(e) {
    if (isFilling) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculamos el ancho y alto del cuadrado
        const width = x - startX;
        const height = y - startY;

        // Rellenar el cuadrado
        ctx.fillStyle = currentColor;
        ctx.fillRect(startX, startY, width, height);
        
        // Emitimos el evento para que otros usuarios vean el cuadrado
        socket.emit('fillRect', { startX, startY, width, height, color: currentColor });
    } else {
        painting = false;
        ctx.beginPath();
    }
}

function draw(e) {
    if (!painting || isFilling) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    socket.emit('draw', { x, y, color: currentColor });
}

socket.on('draw', (data) => {
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = data.color;
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(data.x, data.y);
});

// Función para el botón de rellenar
document.getElementById('fillButton').addEventListener('click', () => {
    isFilling = !isFilling; // Alternar entre modo de rellenar y modo de dibujo
    if (isFilling) {
        // Cambiar el color al hacer clic en el botón
        currentColor = document.getElementById('colorPicker').value; 
    }
});

document.getElementById('resetButton').addEventListener('click', () => {
    currentColor = '#FFFFFF';
    socket.emit('colorChange', currentColor);
});

socket.on('clear', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.getElementById('saveButton').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'canvas-image.png';
    link.click();
});

document.getElementById('colorPicker').addEventListener('input', (e) => {
    currentColor = e.target.value;
    socket.emit('colorChange', currentColor); 
});

socket.on('colorChange', (color) => {
    currentColor = color;
});

// Manejar la subida de imágenes
document.getElementById('imagePicker').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                socket.emit('imageUpload', e.target.result); 
            };
        };

        reader.readAsDataURL(file);
    }
});

socket.on('imageUpload', (imgData) => {
    const img = new Image();
    img.src = imgData;

    img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
});

// Manejando la función de borrado
document.getElementById('eraseButton').addEventListener('click', () => {
    currentColor = '#FFFFFF';
    socket.emit('colorChange', currentColor); 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear'); 
});

// Escuchar el evento de llenado de rectángulo
socket.on('fillRect', (data) => {
    ctx.fillStyle = data.color;
    ctx.fillRect(data.startX, data.startY, data.width, data.height);
});
