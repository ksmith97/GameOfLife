var _ = require('underscore')

const colors = ["red", "blue", "yellow", "orange", "green", "purple", "orangered"];

function generateRandomState(canvas) {
    const wide = Math.ceil(canvas.width / 10);
    const tall = Math.ceil(canvas.height / 10);
    const init = _.map(_.range(0, tall), function() {
        return _.map(_.range(0, wide), function() {
            if(Math.floor(Math.random() * 10) < 4)
                return {color: _.sample(colors)};
            else
                return 0;
        });
    });

    return init;
}

function checkNeighbor(array, x, y) {
    x = x < 0 ? 99 : ((x >= array[0].length ) ? 0 : x);
    y = y < 0 ? 99 : ((y >= array.length ) ? 0 : y);
    
    return array[y][x] ? 1 : 0;
}

let drawingLock = false;
function draw(canvas, array) {
    if(drawingLock)console.log("Warning! We are attempting to draw while currently drawing."); 
    window.drawingLock = true;
    draw2dArray(canvas, array);
    window.drawingLock = false;
};

function draw2dArray(canvas, array) {
    //Reset the canvas by reassigning the width
    canvas.width = canvas.width;
    var context = canvas.getContext("2d");

    for(var x=0; x < array.length; x++) {
      drawArray(context, array[x], x);
    }
};

function drawArray(context, array, index) {
    for(var x=0; x < array.length; x++) {
        drawElement(context, array[x], x, index);
    }
};

function drawElement(context, value, xIndex, yIndex) {
    if(value === 0) return;
    
    var x = xIndex * 10,
    y = yIndex * 10;
    context.fillStyle = _.sample(colors);
    context.fillRect(x, y, 10, 10);
};

function getNeighborPop(x, y, state) {
    var neighbors = 0,
        a = checkNeighbor;
    
    neighbors += a(state, x-1, y-1) + a(state, x, y-1) + a(state, x+1, y-1);
    neighbors += a(state, x-1, y)   +     0     + a(state, x+1, y);
    neighbors += a(state, x-1, y+1) + a(state, x, y+1) + a(state, x+1, y+1);
    return neighbors;
}

function changeState(currentState, x, y, state) {
    var neighborPop = getNeighborPop(x, y, state);
    
    if(neighborPop < 2 || neighborPop > 3)
        return 0;
    else if(neighborPop === 3)
        return 1;
    else
        return currentState;
}

function handleStateArray(elements, indexY, state) {
    var newState = [];
    newState.length = elements.length;
    
    for(var x=0; x<elements.length; x++) {
        newState[x] = changeState(elements[x], x, indexY, state);
    }
    
    return newState;
}

function calculateNewState(oldState) {
    var newState = [];
    newState.length = oldState.length;
    
    for(var x=0; x<oldState.length; x++) {
        newState[x] = handleStateArray(oldState[x], x, oldState);
    }
    return newState;
};

window.createGame = function(canvas) {
  const init = generateRandomState(canvas);
  let gameState = init;
  draw(canvas, init);

  function step() {
      var newState = calculateNewState(gameState);
      //Draw the array.
      draw(canvas, newState);
      gameState = newState;
  };

  var interval = 100,
      mainLoop = null;
  const controls = {
      start : function() {
          if(!mainLoop)
              mainLoop = setInterval(step, interval);
      },
      stop : function() {
          mainLoop && clearInterval(mainLoop);
          mainLoop = null;
      },
      updateInterval : function(newInterval) {
          const value = parseInt(newInterval);
          if(!value) throw new Error("Invalid integer given to update.");

          interval = value;
          if(mainLoop) {
            controls.stop();
            controls.start();
          }
      },
      regenerate : function() {
          gameState = generateRandomState(canvas);
          draw(canvas, gameState)
      },
      interval: () => interval
  }
  return controls;
}
