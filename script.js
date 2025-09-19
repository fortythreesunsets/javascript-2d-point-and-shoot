// #canvas1
const canvas = document.getElementById('canvas1');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// #canvas1
const collisionCanvas= document.getElementById('collisionCanvas');
const collisionContext = collisionCanvas.getContext('2d');

collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;
let score = 0;
context.font = '50px Impact';
let gameOver = false;

let ravens = [];

class Raven {
    constructor() {
        this.spriteWidth = 271;     // width/number of frames of the animation in the sprite
        this.spriteHeight = 194;    // height/number of frames of the animation in the sprite
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 0.25 + 3;
        this.directionY = Math.random() * 0.25 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = 'raven.png';
        this.frame = 0;
        this.maxFrame = 4;
        this.timesSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        this.hasTrail = Math.random() > 0.5;
    }

    update(deltaTime) {
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = this.directionY * - 1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;

        if (this.x < 0 - this.width) this.markedForDeletion = true;
        this.timesSinceFlap += deltaTime;
        if (this.timesSinceFlap > this.flapInterval) {
            if (this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timesSinceFlap = 0;
            if (this.hasTrail) {
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(this.x, this.y, this.width, this.color));
                }
            }
        }
        if (this.x < 0 - this.width) gameOver = true;
    }

    draw() {
        // black rectangle
        //context.fillRect(this.x, this.y, this.width, this.height);

        // rectangle outline
        //context.strokeRect(this.x, this.y, this.width, this.height);

        // Rectangle filled with random color
        collisionContext.fillStyle = this.color;
        collisionContext.fillRect(this.x, this.y, this.width, this.height);

        // image from spritesheet
        context.drawImage(
            this.image, 
            this.frame * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight,
            this.x, this.y, 
            this.width, this.height
        );
    }
}

// Explostion animation and sfx
let explosions = [];
class Explosions {
    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = 'boom.png';
        this.spriteWidth = 200; 
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio(); 
        this.sound.src = 'boom.wav';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltaTime;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5) this.markedForDeletion = true;
        }
    }

    draw() {
        context.drawImage(
            this.image, 
            this.frame * this.spriteWidth, 0, 
            this.spriteWidth, this.spriteHeight, 
            this.x, this.y - this.size/4,
            this.size, this.size
        );
    }
}

// Particle trails
let particles = [];

class Particle {
    constructor(x, y, size, color) {
        this.size = size;
        this.x = x + this.size/2 + Math.random() * 50 - 25;
        this.y = y + this.size/3 + Math.random() * 50 - 25;
        this.radius = Math.random() * this.size/10;
        this.maxRadius = Math.random() *  20 + 35;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
        this.color = color; 
    }

    update() {
        this.x += this.speedX;
        this.radius += 0.3;
        if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;
    }

    draw() {
        context.save();
        context.globalAlpha = 1 - this.radius / this.maxRadius;
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
}


function drawScore() {
    context.fillStyle = 'black';
    context.fillText('Score: ' + score, 50, 75);
    context.fillStyle = 'white';
    context.fillText('Score: ' + score, 55, 70);
}

function drawGameOver() {
    context.textAlign = 'center';
    context.fillStyle = 'black';
    context.fillText('GAME OVER, your score is ' + score, canvas.width/2, canvas.height/2);
    context.fillStyle = 'white';
    context.fillText('GAME OVER, your score is ' + score, canvas.width/2, canvas.height/2 + -5);

}

window.addEventListener('click', function(e) {
    // Color collision detection
    const detectPixelColor = collisionContext.getImageData(e.x, e.y, 1, 1);
    console.log(detectPixelColor);
    const pixelColor = detectPixelColor.data;

    ravens.forEach(object => {
        if (object.randomColors[0] === pixelColor[0] && 
            object.randomColors[1] === pixelColor[1] && 
            object.randomColors[2] === pixelColor[2]) {
                // Colors match = collision detected
                object.markedForDeletion = true;
                score++;
                explosions.push(new Explosions(object.x, object.y, object.width));
            }
        });
})

// In milliseconds so the script runs at the same framerate on every computer
function animate(timestamp) {   
    context.clearRect(0, 0, canvas.width, canvas.height);
    collisionContext.clearRect(0, 0, canvas.width, canvas.height);
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltaTime;

    if (timeToNextRaven > ravenInterval) {
        ravens.push(new Raven());
        timeToNextRaven = 0;
        // Sort ravens by size
        ravens.sort(function(a, b) {
            return a.width - b.width;
        })
    };

    drawScore();

    // array literal with spread operator
    // the order of the arrays are the order of the "layers" on screen
    [... particles, ...ravens, ...explosions].forEach(object => object.update(deltaTime));
    [...particles, ...ravens, ...explosions].forEach(object => object.draw());

    // discard objects outside the screen
    ravens = ravens.filter(object => !object.markedForDeletion);
    explosions = explosions.filter(object => !object.markedForDeletion);
    particles = particles.filter(object => !object.markedForDeletion);

    if (!gameOver) requestAnimationFrame(animate);
    else drawGameOver();
}
// argument = 0 because timestamp gets created on the second run of the loop
animate(0);