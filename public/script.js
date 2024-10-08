const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let painting = false;
let currentColor = '#000000';
let lineWidth = 5;
const socket = io();

let prevX = 0;
let prevY = 0;

canvas.addEventListener('mousedown', (e) => {
    painting = true;
    const rect = canvas.getBoundingClientRect();
    prevX = e.clientX - rect.left;
    prevY = e.clientY - rect.top;
});

canvas.addEventListener('mouseup', () => {
    painting = false;
    ctx.beginPath();
});

canvas.addEventListener('mousemove', (e) => {
    if (!painting) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentColor === '#FF0000') {
        drawFineLine(x, y);
    } else {
        drawLine(x, y);
    }
});

function drawLine(x, y) {
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();

    socket.emit('draw', { prevX, prevY, x, y, color: currentColor, lineWidth });

    prevX = x;
    prevY = y;
}

function drawFineLine(x, y) {
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();

    socket.emit('draw', { prevX, prevY, x, y, color: currentColor, lineWidth: 1 });

    prevX = x;
    prevY = y;
}

socket.on('draw', (data) => {
    ctx.lineWidth = data.lineWidth;
    ctx.strokeStyle = data.color;

    ctx.beginPath();
    ctx.moveTo(data.prevX, data.prevY);
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
});

document.getElementById('fillButton').addEventListener('click', () => {
    const selectedColor = document.getElementById('colorPicker').value;
    ctx.fillStyle = selectedColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    socket.emit('backgroundChange', selectedColor);
});

socket.on('backgroundChange', (color) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
        const x = (canvas.width - img.width) / 2;
        const y = (canvas.height - img.height) / 2;
        ctx.drawImage(img, x, y);
    };
});

document.getElementById('eraseButton').addEventListener('click', () => {
    currentColor = '#FFFFFF';
    socket.emit('colorChange', currentColor);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear');
});

const dropdownItems = document.querySelectorAll('.dropdownItem');

dropdownItems.forEach(item => {
    item.addEventListener('click', () => {
        dropdownItems.forEach(i => {
            i.classList.remove('disabled');
        });

        item.classList.add('disabled');

        const colorPicker = document.getElementById('color');
        colorPicker.src = item.src;

        if (item.id === 'option1') {
            currentColor = color;
            lineWidth = 5;
        } else if (item.id === 'option2') {
            currentColor = color;
            lineWidth = 2;
        }

        dropdownMenu.classList.remove('show');
    });
});

