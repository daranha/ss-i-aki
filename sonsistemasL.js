
let axiom = "L"
let buttons = {}
let tuples = [
  {
    name: "Copo de Koch",
    axiom: "F--F--F",
    rules: { F: "F+F--F+F" },
    angle: 60,
  },
  {
    name: "Curva de Hilbert",
    axiom: "L",
    rules: { L: "+RF-LFL-FR+", R: "-LF+RFR+FL-" },
    angle: 90,
  },
  {
    name: "Curva de Gosper",
    axiom: "FX",
    rules: { X: "X+YF++YF-FX--FXFX-YF+", Y: "-FX+YFYF++YF+FX--FX-Y" },
    angle: 60,
  },
  {
    name: "Curva del Dragón",
    axiom: "FX+FX+FX",
    rules: { X: "X+YF+", Y: "-FX-Y" },
    angle: 90,
  },
  {
    name: "Copo pentagonal",
    axiom: "F-F-F-F-F",
    rules: { F: "F-F++F+F-F-F" },
    angle: 72,
  },
  {
    name: "Ramitas",
    axiom: "F",
    rules: { F: "F[-F]F[+F]F" },
    angle: 25,
  },
  {
    name: "Arbusto Simétrico",
    axiom: "F",
    rules: { F: "F[+F[+F][-F]F][-F[+F][-F]F]F[+F][-F]F" },
    angle: 23,
  },
  {
    name: "Curva de Levy",
    axiom: "F",
    rules: { F: "+F--F+" },
    angle: 45,
  },
  {
    name: "Isla de Koch",
    axiom: "F-F-F-F",
    rules: { F: "F-F+F+FF-F-F+F" },
    angle: 90,
  },
];

let selectedTupleIndex = 0;
let i
let generation
let lines
let boundary
let newAngle
let width
let height
let proportion
let scaleFactor
let button
let xOffset
let yOffset
let on
let epsilon =0.001

let newRules = {"L":"+RF-LFL-FR+", "R":"-LF+RFR+FL-"};
// The midi notes of a scale
// let notes = [ 60, 62, 64, 65, 67, 69, 71];

class Turtle {
  constructor(x, y, angle, angleIncrement) {
    this.x = x
    this.y = y
    this.angle = angle
    this.angleIncrement = angleIncrement
    this.stack = []
  }

  _degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180
  }

  _radiansToDegrees(radians) {
    return (radians * 180) / Math.PI
  }

  forward(distance) {
    distance = distance ?? 1
    this.x = this.x + distance * Math.cos(this._degreesToRadians(this.angle))
    this.y = this.y + distance * Math.sin(this._degreesToRadians(this.angle))
  }

  backward(distance) {
    distance = distance ?? 1
    this.forward(-1 * distance)
  }

  left() {
    this.angle += this.angleIncrement
  }

  right() {
    this.angle -= this.angleIncrement
  }

  push() {
    // console.log(`Saved state: ${this.x}, ${this.y}, ${this.angle}`)
    this.stack.push([this.x, this.y, this.angle])
  }

  pop() {
    if (this.stack.length === 0)
      throw new Error('Underflow.')
    let loaded = this.stack.pop()
    this.x = loaded[0]
    this.y = loaded[1]
    this.angle = loaded[2]

    // console.log(`Loaded state: ${this.x}, ${this.y}, ${this.angle}`)
  }

  position() {
    return [this.x, this.y]
  }

  print() {
    console.log(`Turtle at [${this.x}, ${this.y}] pointing to ${this.angle}`)
  }
}

function iterations(axiom, rules, n) {
  production = iteration(axiom, rules)
  for (let i = 0; i < n - 1; i++) {
    production = iteration(production, rules)
  }
  return production
}

function iteration(axiom, rules) {
  let symbols = axiom.split("");
  let production = []
  for (symbol of symbols) {
    if (hasKey(rules, symbol)) {
      production.push(rules[symbol])
    } else {
      production.push(symbol)
    }
  }
  return production.join("")
}

function hasKey(obj, key) {
  return Object.keys(obj).includes(key)
}

function lSystemToNotes(lSystemString) {
  let currentNote = 65
  let notes = []
  for (symbol of lSystemString.split("")) {
    if (symbol === "F") {
      notes.push(currentNote)
    } else if (symbol === "+") {
      currentNote += 2
    } else if (symbol === "-") {
      currentNote -= 2
    } else if (symbol === "[") {
      continue
    } else if (symbol === "]") {
      continue
    }
  }
  return notes
}

function computeBoundingBox(lines) {
  /*
   * This function takes in a list of pairs of points: [[[x1, y1], [x2, y2]], [[x3, y3], [x4, y4]], ...]
   * representing a list of lines and will compute the bounding box for them in the format [x, ]
   */
  let minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY
  let p1, p2
  for (line_ of lines) {
    p1 = line_[0]
    p2 = line_[1]

    // Compute x boundaries
    if (p1[0] < minX) {
      minX = p1[0]
    }
    if (p2[0] < minX) {
      minX = p2[0]
    }
    if (p1[0] > maxX) {
      maxX = p1[0]
    }
    if (p2[0] > maxX) {
      maxX = p2[0]
    }
    // Compute y boundaries
    if (p1[1] < minY) {
      minY = p1[1]
    }
    if (p2[1] < minY) {
      minY = p2[1]
    }
    if (p1[1] > maxY) {
      maxY = p1[1]
    }
    if (p2[1] > maxY) {
      maxY = p2[1]
    }
  }

  return [minX, minY, (maxX - minX), (maxY - minY)]
}

function parseGeneration(generation, angle) {
  let symbols = generation.split("")
  let turtle = new Turtle(0, 0, 0, angle)
  let lines = []
  let initial, final
  for (symbol of symbols) {
    if (symbol == "F") {
      initial = turtle.position()
      turtle.forward()
      final = turtle.position()
      lines.push([initial, final])
    } else if (symbol == "+") {
      turtle.left()
    } else if (symbol == "-") {
      turtle.right()
    } else if (symbol == "[") {
      turtle.push()
    } else if (symbol == "]") {
      turtle.pop()
    }
  }
  return lines
}

function processGeneration(generation) {
  notes = lSystemToNotes(generation)
  lines = parseGeneration(generation, newAngle)
  boundary = computeBoundingBox(lines)

  if (width < height) {
    if (boundary[3] - boundary[2] < epsilon) {
      scaleFactor = width * proportion / boundary[2]
    } else {
      scaleFactor = height * proportion / boundary[3]
    }
  } else {
    if (boundary[2] - boundary[3] < epsilon) {
      scaleFactor = height * proportion / boundary[3]
    } else {
      scaleFactor = width * proportion / boundary[2]
    }
  }

  
  fractalWidth = boundary[2] * scaleFactor
  fractalHeight = boundary[3] * scaleFactor

  xOrigin = boundary[0] * scaleFactor
  yOrigin = boundary[1] * scaleFactor

  xOffset = -1 * xOrigin + (width - fractalWidth) / 2
  yOffset = -1 * yOrigin + (height - fractalHeight) / 2

  i = 0
  background(101)
  drawFull()
}

function generate() {
  getAudioContext().resume();
  generation = iteration(generation, newRules)
  processGeneration(generation)
}

function restart() {
  i = 0
  background(101)
}

function pause() {
  on = false
}

function play() {
  on = true
}

function setup() {
  width = 800
  height = 600// width * boundary[3] / boundary[2]
  proportion = .75 // How much of the canvas should the drawing take
  on = true
  createCanvas(width, height)
  // add input buttons
  //createInputButtons();
  createPreloadedRulesButtons();

  // A triangle oscillator
  osc = new p5.TriOsc();
  env = new p5.Envelope();
  osc.start()
  env.play(osc);

  generation = axiom
  processGeneration(generation)

  button = createButton("generate")
  button.mousePressed(generate)

  button = createButton("restart")
  button.mousePressed(restart)

  button = createButton("play")
  button.mousePressed(play)

  button = createButton("pause")
  button.mousePressed(pause)
}

function drawFull() {
  stroke(0);
  for (line_ of lines) {
    let p1, p2
    p1 = line_[0]
    p2 = line_[1]
    line(xOffset + p1[0] * scaleFactor, yOffset + p1[1] * scaleFactor, xOffset + p2[0] * scaleFactor, yOffset + p2[1] * scaleFactor)
  }
  
  stroke(255, 204, 0);
}


function draw() {
  /* This function is native to p5.js, it will be called on every frame, what we are doing here is to paint a
   * step of the fractal per frame which makes the animation flow.
   */
  if (i < lines.length && on) {
    let p1, p2
    let line_ = lines[i]
    p1 = line_[0]
    p2 = line_[1]

    osc.freq(midiToFreq(notes[i]))
    env.ramp(osc, 0, 1.0, 0)    
    
    line(xOffset + p1[0] * scaleFactor, yOffset + p1[1] * scaleFactor, xOffset + p2[0] * scaleFactor, yOffset + p2[1] * scaleFactor)
    i++

  } else {
    osc.freq(0)
  }
}

function createInputButtons() {
  var startingX = 600;
  var startingY = 20;
  in_axioma = createElement('span', 'Axioma');
  in_regla = createElement('span', 'Regla');
  in_angle = createElement('span', 'Ángulo');
  in_axioma.position(startingX, startingY);
  in_regla.position(startingX, startingY + 20);
  in_angle.position(startingX, startingY + 40);

  // caja de input para axioma
  in_axm = createInput();
  in_axm.value(axiom);
  var axioma = in_axm.value();
  in_axm.position(startingX + 55,startingY);
 // caja de input para regla
  in_rul = createInput();
  //in_rul.value(newRules["F"]);
  var regla = in_rul.value();
  in_rul.position(startingX + 55, startingY + 20);

  in_ang = createInput();
  var angulo = in_ang.value();
  in_ang.position(startingX + 55,startingY + 40);

  angSlider = createSlider(0, 90, 60, 5);
  angSlider.position(startingX + 205, startingY + 40);
  angle = radians(angSlider.value());
  in_ang.value(angSlider.value());


// crear botones que escriban input al axioma
  createButton("F").mouseClicked(addCharacter_ta).position(startingX + 205,startingY);
  createButton("+").mouseClicked(addCharacter_ta).position(startingX + 230,startingY);
  createButton("-").mouseClicked(addCharacter_ta).position(startingX + 255,startingY);
// crear botones que escriban input a la regla
  createButton("F").mouseClicked(addCharacter).position(startingX + 205,startingY + 20);
  createButton("+").mouseClicked(addCharacter).position(startingX + 230,startingY + 20);
  createButton("-").mouseClicked(addCharacter).position(startingX + 255,startingY + 20);
  createButton("[").mouseClicked(addCharacter).position(startingX + 280,startingY + 20);
  createButton("]").mouseClicked(addCharacter).position(startingX + 300,startingY + 20);
// slider para el ángulo
// enviar strings escritas
  button1 = createButton('submit');
  button1.position(startingX + 85, startingY + 65);
  button1.mousePressed(storeAxiom);
  button1.mousePressed(storeRule);

}

function createPreloadedRulesButtons() {
  var startingX = 20;
  var startingY = 20;
  // Here begins the menu for chosing an existing axiom, rules
  for (let j = 0; j < tuples.length; j++) {
      textSize(16)
      textAlign(LEFT, CENTER)
      buttons[tuples[j].name] = createButton(tuples[j].name).mouseClicked(function () {
        axiom = tuples[j].axiom
        newRules = tuples[j].rules
        newAngle = int(tuples[j].angle)
        generation = axiom
        clearButtons()
        buttons[tuples[j].name].addClass("active")
      }
    ).position( startingX, startingY + j * 23)
    }
}

function clearButtons() {
  for (button of Object.values(buttons)) {
    button.removeClass("active")
  }
}
