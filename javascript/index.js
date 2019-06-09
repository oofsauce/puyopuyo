const w = window,
    d = document,
    e = d.documentElement,
    g = d.body

var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d")

const setResizeHandler = (callback, timeout) => {
  var timer_id = undefined
  window.addEventListener("resize", function() {
      if(timer_id != undefined) {
          clearTimeout(timer_id)
          timer_id = undefined
      }
      timer_id = setTimeout(function() {
          timer_id = undefined
          callback()
      }, timeout)
  })
}

const resizeCanvas = () => {
  canvas.width  = w.innerWidth  || e.clientWidth  || g.clientWidth
  canvas.height = w.innerHeight || e.clientHeight || g.clientHeight
}
setResizeHandler(resizeCanvas, 100)
resizeCanvas()

const keys = {}
window.addEventListener('keydown', (e) => {
  keys[e.keyCode] = 2
  e.preventDefault()
})
window.addEventListener('keyup', (e) => {
  keys[e.keyCode] = 0
})
const getKey = (code) => {
  return keys[code] != 0
}
const getKeyDown = (code) => {
  const r = keys[code]
  if (r == 2) {
    keys[code] = 1
    return true
  }
  return false
}

const colors = [
  "transparent",
  "red",
  "green",
  "orange",
  "purple",
  "blue"
]

const activeBlock = {
  x:0,
  y:0,
  rot:0,
  positions: blocks.basic([1,2], 0)
}

var prev
const draw = (dt) => {
  ctx.clearRect(0,0,canvas.width, canvas.height)

  // ACTIVE BLOCK DRAWING & COLLISION DETECTION (this is where the fun begins)
  for(let i = 0; i < activeBlock.positions.length; i++) {
    let block = activeBlock.positions[i];
    let x = activeBlock.x + block[0]
    let y = activeBlock.y + block[1]
    ctx.fillStyle = colors[block[2]]
    ctx.fillRect(30+x*30, 30+y*30, 30, 30);
  }

  // BOARD DRAWING
  for(let y = 0; y < testBoard.height; y++) {
    for(let x = 0; x < testBoard.width; x++) {
      ctx.fillStyle = colors[testBoard.map[y][x]]
      ctx.fillRect(30 + (x * 30), 30 + (y * 30), 30, 30)
      ctx.strokeStyle = "1px solid black"
      ctx.strokeRect(30 + (x * 30), 30 + (y * 30), 30, 30)
    }
  }

  ctx.fillStyle = "black";
  ctx.fillText(dt*1000, 10, 10)
}

const data = {x:0, y:0, r:1}

var discreteTimer = 0;

const tick = (now) => {
  window.requestAnimationFrame(tick)

  const dt = (now - prev)/1000 // change in seconds
  prev = now

  switch(testBoard.state) {
    case state.SETTLING:
      discreteTimer += dt;
      if (discreteTimer > 0.05) {
        discreteTimer = 0
        if (!testBoard.SettleBoard()) {   // if settling the board does not result in a change, board is done settling
          if(!testBoard.DestroyGroups()) {          // and if after board is settled no groups are destroyed
            testBoard.state = state.DEFAULT  // return to normal play
          }
        }
      }
    break;

    case state.DEFAULT:
      // TIMED BLOCK FALLING (aka gravity)
      discreteTimer += dt;
      if (discreteTimer > 0.5) { //TODO: change this value with a configurable one, based on difficulty
        discreteTimer = 0;
        activeBlock.y += 1
      }

      // ACTIVE BLOCK MOVEMENT
      if (getKeyDown(65)) {
        activeBlock.x -= 1
      } else if (getKeyDown(68)) {
        activeBlock.x += 1
      }
      // } else if (getKeyDown(87)) {
      //   activeBlock.y -= 1
      // } else if (getKeyDown(83)) {
      //   activeBlock.y += 1
      // }
      
      // ACTIVE BLOCK ROTATION
      if(getKeyDown(81)) {
        activeBlock.rot = (activeBlock.rot + 1) % 4
        activeBlock.positions = blocks.basic([1,2], activeBlock.rot)
      } else if (getKeyDown(69)) {
        activeBlock.rot = (activeBlock.rot - 1) % 4
        if (activeBlock.rot < 0) {
          activeBlock.rot += 4
        }
        activeBlock.positions = blocks.basic([1,2], activeBlock.rot)
      }
      
      // MISC KEYS
      if(getKeyDown(32)) { //SPACEBAR - Place shape
        testBoard.PlaceShape(activeBlock.x, activeBlock.y, activeBlock.positions)
      }
      if(getKeyDown(71)) { //G - Destroy Groups
        testBoard.DestroyGroups()
      }
      if(getKeyDown(78)) { //N - Force Settle Board
        testBoard.SettleBoard()
      }

      // COLLISION DETECTION
      // TODO: figure out if there's a better way besides merging with the draw
      // loop, to avoid doubling up
    break;
    default:

    break;
  }

  

  // data.r = (data.r + (dt * 10)) % (Math.PI*2)
  // data.x = Math.sin(data.r) * 30 + 60
  // data.y = Math.cos(data.r) * 30 + 60

  draw(dt)
}

var testBoard = new Board(10,20,function(board){
  
});
testBoard.PlaceBlock(2,10,blocks.basic([2,3], activeBlock.rot));

// for( let i = 0; i < 4; i++){
//   testBoard.PlaceBasicShape(4,4,i,4,i+1);
// }
// testBoard.SettleBoard()


prev = performance.now()
window.requestAnimationFrame(tick)

