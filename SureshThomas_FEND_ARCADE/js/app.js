/****
 * The coordinate class -
 */
class Coordinate{
    constructor(x,y){
        this.x=x;
        this.y=y;
    }
}

/**
 * A property handler - this is not strictly needed by added to understand the  learning from udacity
 * @type {{get: handler.get}}
 */
let handler = {
    get: function (obj, prop) {
        if (prop in obj) return obj[prop];
        throw new TypeError(`Invalid property ${prop}`);

    }
};
// This is the property aggregator;
let gameVariables = new Proxy({}, handler);

//get canvas size and keep
let canvasElem = document.querySelector('canvas');
gameVariables.boardWidth = canvasElem.scrollWidth;  //canvas.width = 505;
gameVariables.boardHeight = canvasElem.scrollHeight; //canvas.height = 606;

// The aim is to avoid hard coded values
const GAME_INVARIANTS = Object.freeze({
    MAX_LIVES: 3,
    START_SCORE: 0,
    MAX_SCORE:100,
    ENEMY_WIDTH:80, //Width of enemy image
    ENEMY_HEIGHT:60,
    PLAYER_STEP_HORZ:101,//Horizontal steps size
    PLAYER_STEP_VERT:54, //Vertical step size
    PLAYER_START_POSITION_X:202,
    PLAYER_START_POSITION_Y:386
 });

/**
 * Enemy class
 * @param x x coordnate
 * @param y coordinate
 * @param speed
 * @constructor
 */
let Enemy = function (x, y, speed) {

    this.sprite = 'images/enemy-bug.png';
    this.position = new Coordinate(x,y);
    this.speed = speed;
};

// Update the Enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    this.position.x += this.speed * dt;

    // Once enemies are off the canvas, they reappear randomly with different speeds
    if (this.position.x > gameVariables.boardWidth) {
        this.position.x = -40;
        this.speed = 100 + Math.floor(Math.random() * 150);
    }

    // Checks for collisions between the player and the enemies
    if (player.position.x < this.position.x + GAME_INVARIANTS.ENEMY_WIDTH &&
        player.position.x + GAME_INVARIANTS.ENEMY_WIDTH > this.position.x &&
        player.position.y < this.position.y + GAME_INVARIANTS.ENEMY_HEIGHT &&
        GAME_INVARIANTS.ENEMY_HEIGHT + player.position.y > this.position.y) {
            //Dead
            openCrushedMessageBox();
            closeButton.addEventListener('click',closeMessageBox);
            window.addEventListener('click', clickOutsideAndCloseMessage);
            player.position.x = GAME_INVARIANTS.PLAYER_START_POSITION_X;
            player.position.y = GAME_INVARIANTS.PLAYER_START_POSITION_Y;

    }

};
// Draw the Enemy on the screen, required method for game
Enemy.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.position.x, this.position.y);
};

/*
  ------------------------------
    P L A Y E R   S E T   U P
  ------------------------------
*/


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.


let Player = function () {
    this.spriteIndex = Math.floor(Math.random() * 5);
    this.setPlayerImage();  // ASSIGN THE PLAYER BASES ON INDEX
    this.position = new Coordinate(GAME_INVARIANTS.PLAYER_START_POSITION_X,GAME_INVARIANTS.PLAYER_START_POSITION_Y);

};


// CHARACTER IMAGES
Player.prototype.SPRITES = [
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
];

/* PLAYER METHODS */

// ASSIGN THE PLAYER BASES ON INDEX
Player.prototype.setPlayerImage = function () {
    this.sprite = this.SPRITES[this.spriteIndex];
};
// INCREMENT INDEX WITHIN SPRITE ARRAY
Player.prototype.chooseNextImage = function () {
    this.spriteIndex < this.SPRITES.length - 1 ? this.spriteIndex++ : this.spriteIndex = 0;
};

let messageBox = document.getElementById('startWinner'); // GET MODAL ELEMENT
let closeButton = document.getElementById('closeBtn'); // GET CLOSE BUTTON

// OPEN MODAL FUNCTION
function openWinningMessageBox() {
    document.getElementById('msg').innerText="Congrats ! you won";
    messageBox.style.display = 'block';
}

function openCrushedMessageBox() {
    document.getElementById('msg').innerText="Oops ! try again";
    messageBox.style.display = 'block';
}

// CLOSE MODAL FUNCTION
function closeMessageBox() {
    messageBox.style.display = 'none';
}

// CLOSE MODAL FUNCTION IF CLICKED OUTSIDE MODAL
function clickOutsideAndCloseMessage(e) {
    if (e.target === messageBox) {
        messageBox.style.display = 'none';
    }
}

// UPDATE PLAYER POSITION
Player.prototype.update = function () {


    // X AXIS BOUNDARIES

    if (player.position.x < 0) {
        this.position.x = 0;
    } else if (player.position.x > (505-83)) {
        this.position.x = (505-83);
    }
    // Y AXIS BOUNDARIES
    else if (player.position.y > 400) {
        this.position.y = 400;
    }
    // SCORING FOR PLAYER REACHING WATER
    else if (player.position.y <= -40) {
        console.log(`player position ${player.position.y}`);
        //Game won
        openWinningMessageBox();
        closeButton.addEventListener('click',closeMessageBox);
        window.addEventListener('click', clickOutsideAndCloseMessage);
        this.reset();

    }

};


//Player drawing

Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.position.x, this.position.y);
};

//Added contains method to array
Array.prototype.contains = function(element){
    return this.indexOf(element) > -1;
};

// I have re-implemented - removed the depricated key method. Also removed switch case - The switch case is an anti pattern to OOP.  So object literal is the answer ?
Player.prototype.handleInput = function (keyPress) {
    //Dont handle unwanted keys, added a utility function to array prototype
    if(!['left','up','right','down','space'].contains(keyPress)){
        return;
    }

     let handleKeyPress = {
        'left':function (pl) {
            pl.position.x -= GAME_INVARIANTS.PLAYER_STEP_HORZ;
        },
         'up':function (pl) {

             pl.position.y -= GAME_INVARIANTS.PLAYER_STEP_VERT;
         },
         'right':function (pl) {
             pl.position.x += GAME_INVARIANTS.PLAYER_STEP_HORZ;
         },
         'down':function (pl) {

             pl.position.y += GAME_INVARIANTS.PLAYER_STEP_VERT;
         },
         'space':function (pl) {
             pl.chooseNextImage();
             pl.setPlayerImage();
         }
     };
    //Any other key should be ignored
    try {
        handleKeyPress[keyPress](this);
    }catch(err){
        console.log(`key is not handled ${err}`);
    }

};

// SET CHARACTER AT STARTING POINT
Player.prototype.reset = function () {
    this.position.x = GAME_INVARIANTS.PLAYER_START_POSITION_X ;
    this.position.y = GAME_INVARIANTS.PLAYER_START_POSITION_Y ;

};


let player = new Player();

// Place all Enemy objects in an array called enemies
//The below is what I hate - there should be a better method of building this enemy array - compramised due to lack of time
let enemy1 = new Enemy(-80, 60, (Math.floor(Math.random() * 4 + 1) * 30));
let enemy2 = new Enemy(120, 140 , (Math.floor(Math.random() * 4 + 1) * 15));
let enemy3 = new Enemy(200, 220, (Math.floor(Math.random() * 4 + 1) * 45));


let enemies = [enemy1, enemy2, enemy3];
// The below line make it compatible to firefox
let allEnemies = enemies;




// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
// Suresh Thomas - I have modified it to remove depricated
document.addEventListener('keydown', function (e) {
    let allowedKeys = {
        //Space is used to toggle player image
        'Space': 'space',

        //arrow keys
        'ArrowLeft': 'left',
        'ArrowUp': 'up',
        'ArrowRight': 'right',
        'ArrowDown': 'down',

        //Keys instead of arrows
        'KeyA': 'left',
        'KeyW': 'up',
        'KeyD': 'right',
        'KeyS': 'down',

    };

    player.handleInput(allowedKeys[e.code]);
});