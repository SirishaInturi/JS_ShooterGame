/**@type {HTMLCanvasElement} */
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = window.innerWidth;
const CANVAS_HEIGHT = canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;
let correctValueEntered = false;
let GAMETIME = 120000;
let firstTimeStamp = 0;

let ravens = [];
let explosions = [];
let particles = [];
let timeToNextRaven = 0;
const ravenInterval = 500;
let lastTimeStamp = 0;
let score = 0;
ctx.font = '50px Impact';
class Raven{
    constructor(){
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;   
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;

        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = 'raven.png';
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        this.hasTrail = Math.random() > 0.7;
    }
    update(deltaTime){
        if(this.y<0||this.y>canvas.height-this.height){
            this.directionY *=-1;
        }
        this.x -= this.directionX;
        this.y +=this.directionY;
        if(this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceFlap +=deltaTime;
        if(this.timeSinceFlap > this.flapInterval){
            if(this.frame>this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceFlap = 0;
            if (this.hasTrail){
                for (let i = 0; i < 5; i++){
                    particles.push(new Particle(this.x, this.y, this.width, this.color));
                }
            }
        }
    }
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x,this.y,this.width,this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

class Explosion{
    constructor(x,y,size){
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
    update(deltatime){
        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltatime;
        if (this.timeSinceLastFrame > this.frameInterval){
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5) this.markedForDeletion = true;
        }    
    }
    draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size);
    }
}
class Particle {
    constructor(x, y, size, color){
        this.size = size;
        this.x = x + this.size/2 + Math.random() * 50 - 25;
        this.y = y + this.size/3  + Math.random() * 50 - 25;
        this.radius = Math.random() * this.size/10;
        this.maxRadius = Math.random() * 20 + 35;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
        this.color = color;
    }
    update(){
        this.x += this.speedX;
        this.radius += 0.3;
        if (this.radius > this.maxRadius - 1) this.markedForDeletion = true;
    }
    draw(){
        ctx.save();
        ctx.globalAlpha = 1 - this.radius/this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawScore(){
    ctx.fillStyle = 'black';
    ctx.fillText('Score: '+score,50,75);
    ctx.fillStyle = 'white';
    ctx.fillText('Score: '+score,55,80);
}
function drawGameOver(){
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('GAME OVER, your score is ' + score, canvas.width/2, canvas.height/2);
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER, your score is ' + score, canvas.width/2 + 5, canvas.height/2 + 5);
    firstTimeStamp = 0;
    timestamp = 0;
    promptMath();
}

function promptMath(){
    var randomNum1;
    var randomNum2;
    //set the largeest number to display
    var maxNum = 50;
    var total;
    randomNum1 = Math.ceil(Math.random() * maxNum +1);
    randomNum2 = Math.ceil(Math.random() * 9 +1);
    total = randomNum1 + randomNum2;

    var enteredValue = prompt(randomNum1 + " + " + randomNum2 + "=", "");
    if (enteredValue == null || enteredValue == "") {
        promptMath();
    }
    else
    {
       if((total+"")==enteredValue){
            correctValueEntered = true;
            animate(0);
       }
    }
}
window.addEventListener('click',function(e){
    const detectPixelColor = collisionCtx.getImageData(e.x,e.y,1,1);
    console.log(detectPixelColor);
    const pc = detectPixelColor.data;
    ravens.forEach(object => {
        if (object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] && object.randomColors[2] === pc[2]){
            // collision detected
            object.markedForDeletion = true;
            score++;
            explosions.push(new Explosion(object.x, object.y, object.width));
        }
    });
});
function animate(timestamp){
    ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    collisionCtx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    if(firstTimeStamp === 0 && timestamp ===0 && !correctValueEntered){
        promptMath();
    }
    if(firstTimeStamp === 0 && timestamp !=0){
        firstTimeStamp = timestamp;
    } 
    let deltaTime = timestamp - lastTimeStamp;
    lastTimeStamp = timestamp;
    timeToNextRaven +=deltaTime;
    if(timeToNextRaven > ravenInterval){
        ravens.push(new Raven());
        timeToNextRaven = 0;
        ravens.sort((a,b)=>a.width-b.width);
    }
    drawScore();
    [ ...particles, ...ravens, ...explosions].forEach(object => object.update(deltaTime));
    [ ...particles, ...ravens, ...explosions].forEach(object => object.draw());
    ravens = ravens.filter(object => !object.markedForDeletion);
    explosions = explosions.filter(object => !object.markedForDeletion);
    particles = particles.filter(object => !object.markedForDeletion);
    ravens = ravens.filter(object => !object.markedForDeletion);
    if(Math.abs(firstTimeStamp-timestamp)<GAMETIME)
    requestAnimationFrame(animate);
    else
    drawGameOver();
}
animate(0);