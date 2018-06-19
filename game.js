/**
 * A LARGE PART OF JAVASCRIPT IS AVAIABLE AT: http://jsfiddle.net/kHJr6/2/
 */
const model = tf.sequential();
/**
 * TOTAL INPUTS ARE 8:
 * current x and y coordinates of the pong
 * previous x and y coordinates of the pong
 * current player's paddle
 * current computer's paddle
 * previous player's paddle
 * previous computer's paddle
 */

 /** TOTAL OUTPUTS ARE 3:
  * [1,0,0] , [0,1,0] , [0,0,1]
  * right   , no move , left
  * the output will undergo argmax which will 
  * return the index of the largest value.
  * the index will be subtracted by 1.
  * resulting in -1, 0 or 1 for left,no move,right respectively
  * this output can be multiplied by no. of pixels we want 
  * to move. eg: -1 * 5 will move 5 pixels to the left 
  */
model.add(tf.layers.dense({units: 256, inputShape: [8]}));
model.add(tf.layers.dense({units: 512, inputShape: [256]}));
model.add(tf.layers.dense({units: 256, inputShape: [512]}));
model.add(tf.layers.dense({units: 3, inputShape: [256]}));  
const learningRate = 0.001;
const optimizer = tf.train.adam(learningRate);
model.compile({loss: 'meanSquaredError', optimizer: optimizer});

/**
 * following source: http://jsfiddle.net/kHJr6/2/
 */
var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000 / 60)
};

var canvas = document.createElement("canvas");
var width = 400;
var height = 600;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');
var player = new Player();
var computer = new Computer();
var ball = new Ball(200, 300);
var ai = new AI();

var keysDown = {};

var render = function () {
context.fillStyle = "#000000";
context.fillRect(0, 0, width, height);
player.render();
computer.render();
ball.render();
};


var update = function () {
player.update();
if(computer.ai_plays){
    move = ai.predict_move();
    computer.ai_update(move);
}else
    computer.update(ball);
ball.update(player.paddle, computer.paddle);
ai.save_data(player.paddle, computer.paddle, ball)
};


var step = function () {
update();
render();
animate(step);
};


function Paddle(x, y, width, height) {
this.x = x;
this.y = y;
this.width = width;
this.height = height;
this.x_speed = 0;
this.y_speed = 0;
}


Paddle.prototype.render = function () {
context.fillStyle = "#59a6ff";
context.fillRect(this.x, this.y, this.width, this.height);
};


Paddle.prototype.move = function (x, y) {
this.x += x;
this.y += y;
this.x_speed = x;
this.y_speed = y;
if (this.x < 0) {
    this.x = 0;
    this.x_speed = 0;
} else if (this.x + this.width > 400) {
    this.x = 400 - this.width;
    this.x_speed = 0;
}
};


function Computer() {
this.paddle = new Paddle(175, 10, 50, 10);
this.ai_plays = false;
}


Computer.prototype.render = function () {
this.paddle.render();
};


Computer.prototype.update = function (ball) {
var x_pos = ball.x;
var diff = -((this.paddle.x + (this.paddle.width / 2)) - x_pos);
if (diff < 0 && diff < -4) {
    diff = -5;
} else if (diff > 0 && diff > 4) {
    diff = 5;
}
this.paddle.move(diff, 0);
if (this.paddle.x < 0) {
    this.paddle.x = 0;
} else if (this.paddle.x + this.paddle.width > 400) {
    this.paddle.x = 400 - this.paddle.width;
}
};

/**
 * CODED :
 * The predictions can be 0 , 1 or 2 (index values) and subtracted by 1
 * The end value can be -1, 0 or 1 for left,no move,right respectively
 * this output can be multiplied by no. of pixels we want 
 * to move. eg: -1 * 5 will move 5 pixels to the left 
 */
Computer.prototype.ai_update = function (move = 0) {
    this.paddle.move(5 * move, 0);
};

/**
 * following source: http://jsfiddle.net/kHJr6/2/
 */
function Player() {
    this.paddle = new Paddle(175, 580, 50, 10);
}


Player.prototype.render = function () {
    this.paddle.render();
};


Player.prototype.update = function () {
    for (var key in keysDown) {
        var value = Number(key);
        if (value == 37) {
            this.paddle.move(-4, 0);
        } else if (value == 39) {
            this.paddle.move(4, 0);
        } else {
            this.paddle.move(0, 0);
        }
    }
};


function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.x_speed = 0;
    this.y_speed = 3;
}


Ball.prototype.render = function () {
    context.beginPath();
    context.arc(this.x, this.y, 5, 2 * Math.PI, false);
    context.fillStyle = "#ddff59";
    context.fill();
};


Ball.prototype.update = function (paddle1, paddle2, new_turn) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    var top_x = this.x - 5;
    var top_y = this.y - 5;
    var bottom_x = this.x + 5;
    var bottom_y = this.y + 5;

    if (this.x - 5 < 0) {
        this.x = 5;
        this.x_speed = -this.x_speed;
    } else if (this.x + 5 > 400) {
        this.x = 395;
        this.x_speed = -this.x_speed;
    }

    if (this.y < 0 || this.y > 600) {
        this.x_speed = 0;
        this.y_speed = 3;
        this.x = 200;
        this.y = 300;
        ai.new_turn();
    }

    if (top_y > 300) {
        if (top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y && top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x) {
            this.y_speed = -3;
            this.x_speed += (paddle1.x_speed / 2);
            this.y += this.y_speed;
        }
    } else {
        if (top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y && top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x) {
            this.y_speed = 3;
            this.x_speed += (paddle2.x_speed / 2);
            this.y += this.y_speed;
        }
    }
};

/**
 * CODED
 * We need to function to collect and store variables
 */
function AI(){
    this.previous_data = null;
    this.training_data = [[], [], []];
    this.last_data_object = null;
    this.turn = 0;
    this.grab_data = true;
    this.flip_table = true;
}

// Custom code:
// This code is responsible for saving data per frame
AI.prototype.save_data = function(player, computer, ball){
    if(!this.grab_data)
        return;

    // If this is the very first frame (no prior data):
    if(this.previous_data == null){
        data = this.flip_table ? [width - computer.x, width - player.x, width - ball.x, height - ball.y] : [player.x, computer.x, ball.x, ball.y];
        this.previous_data = data;
        return;
    }

    // table is rotated to learn from player, but apply to computer position:
    if(this.flip_table){
        data_xs = [width - computer.x, width - player.x, width - ball.x, height - ball.y];
        index = ((width - player.x) > this.previous_data[1])?0:(((width - player.x) == this.previous_data[1])?1:2);
    }else{
        data_xs = [player.x, computer.x, ball.x, ball.y];
        index = (player.x < this.previous_data[0])?0:((player.x == this.previous_data[0])?1:2);
    }

    this.last_data_object = [...this.previous_data, ...data_xs];
    this.training_data[index].push(this.last_data_object);
    this.previous_data = data_xs;
}

// Custom code:
// deciding whether to play as ai
AI.prototype.new_turn = function(){
    this.previous_data = null;
    this.turn++;
    console.log('new turn: ' + this.turn);

    //hm games til train?
    if(this.turn > 1){
        this.train();
        computer.ai_plays = true;
        this.reset();
    }
}   

// Custom code:
// empty training data to start clean
AI.prototype.reset = function(){
    this.previous_data = null;
    this.training_data = [[], [], []];
    this.turn = 0;
}

// Custom code:
// trains a model
AI.prototype.train = function(){
    console.log('balancing');

    //shuffle attempt
    len = Math.min(this.training_data[0].length, this.training_data[1].length, this.training_data[2].length);
    if(!len){
        console.log('nothing to train');
        return;
    }
    data_xs = [];
    data_ys = [];
    for(i = 0; i < 3; i++){
        data_xs.push(...this.training_data[i].slice(0, len));
        data_ys.push(...Array(len).fill([i==0?1:0, i==1?1:0, i==2?1:0]));
    }


    console.log('training');
    const xs = tf.tensor(data_xs);
    const ys = tf.tensor(data_ys);

    (async function() {
        console.log('training2');
        let result = await model.fit(xs, ys);
        console.log(result);
    }());
    console.log('trained');

}

// Custom code:
AI.prototype.predict_move = function(){
    console.log('predicting');
    if(this.last_data_object != null){
        //use this.last_data_object for input data
        //do prediction here
        //return -1/0/1
        prediction = model.predict(tf.tensor([this.last_data_object]));
        return tf.argMax(prediction, 1).dataSync()-1;
    }

}

// Original pong code:
document.body.appendChild(canvas);
animate(step);

window.addEventListener("keydown", function (event) {
    keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function (event) {
    delete keysDown[event.keyCode];
});