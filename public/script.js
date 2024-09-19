const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let painting = false;

const socket = io();
let currentColor = '#000000'; 

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

function startPosition(e) {
    painting = true;
    draw(e);
}

function endPosition() {
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;

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

// Evento para borrar el canvas y cambiar color a blanco
document.getElementById('eraseButton').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear');
});

// Escuchar el evento de borrar
socket.on('clear', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Evento para guardar el canvas
document.getElementById('saveButton').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'canvas-image.png';
    link.click();
});

// Cambiar el color del trazo
document.getElementById('colorPicker').addEventListener('input', (e) => {
    currentColor = e.target.value;
    socket.emit('colorChange', currentColor); 
});

// Escuchar cambios de color de otros usuarios
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

// Escuchar imágenes de otros usuarios
socket.on('imageUpload', (imgData) => {
    const img = new Image();
    img.src = imgData;

    img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
});

// Evento para resetear el canvas y cambiar el color del pincel a blanco
document.getElementById('resetButton').addEventListener('click', () => {
    currentColor = '#FFFFFF';
    socket.emit('colorChange', currentColor); 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear'); 
});
