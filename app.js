"use strict";

// wait for page load
window.addEventListener("load", init)

// declare canvas variables
let c, ctx, width, height

// declare element variables
let start, stop, reset, iterationsInput, radiusInput

// declare mouse variables
let mouseX, mouseY

// declare simulation variables
let running, simX, simY, iterations, radius

function init() {
  // configure canvas
  c = document.querySelector("canvas")
  ctx = c.getContext("2d")

  // configure overlay
  start = document.querySelector("#start")
  start.addEventListener('click', () => {
    // reset canvas
    ctx.clearRect(0, 0, width, height)
    requestAnimationFrame(drawTriangles)

    // refresh config
    iterations = iterationsInput.value
    radius = radiusInput.value

    // set fill style to white
    ctx.fillStyle = 'rgb(255, 255, 255)'

    // pick random point
    simX = Math.random()
    simY = Math.random()

    running = true
    iterate()
  })

  stop = document.querySelector("#stop")
  stop.addEventListener('click', () => {
    running = false
  })

  reset = document.querySelector("#reset")
  reset.addEventListener('click', () => {
    // set triangle configuration to default
    triangle = [
      { x: 0.5, y: 0.2, weight: 0.5 },
      { x: 0.3, y: 0.8, weight: 0.5 },
      { x: 0.7, y: 0.8, weight: 0.5 },
    ]

    // stop simulation
    running = false

    // reset canvas
    ctx.clearRect(0, 0, width, height)
    requestAnimationFrame(drawTriangles)
  })

  iterationsInput = document.querySelector("#iterations-input")
  radiusInput = document.querySelector("#radius-input")

  // detect screen resize
  window.addEventListener("resize", refreshSize)

  // detect mouse movement
  window.addEventListener('mousemove', (e) => {
    // refresh mouse variables
    mouseX = e.clientX
    mouseY = e.clientY

    // check if node is being dragged
    if (dragTarget != null) {
      // move node to mouse position
      dragTarget.x = mouseX / width
      dragTarget.y = mouseY / height

      // redraw triangle and circle
      ctx.clearRect(0, 0, width, height)
      requestAnimationFrame(drawTriangles)
      drawNodeInfo(dragTarget)

      // prevent the rest of the function from executing
      return
    }

    // detect change in hover status
    triangle.forEach(node => {
      const hover = checkNodeHover(node)
      if (hover && hoverTarget != node) {
        hoverTarget = node
        drawNodeInfo(node)
      } else if (!hover && hoverTarget == node) {
        hoverTarget = null
        ctx.clearRect(0, 0, width, height)
        requestAnimationFrame(drawTriangles)
      }
    })
  })

  // handle mouse down
  window.addEventListener('mousedown', () => {
    // detect if any nodes are hovered
    if (hoverTarget != null) {
      dragTarget = hoverTarget
    }
  })

  // handle mouse up
  window.addEventListener('mouseup', () => {
    if (dragTarget != null) {
      dragTarget = null
    }
  })

  // handle scroll
  window.addEventListener('wheel', (e) => {
    // determine if any nodes are hovered
    if (hoverTarget != null) {
      // change node weight based on scroll direction
      const newWeight = Math.round(hoverTarget.weight * 100) + Math.sign(e.deltaY) * -2
      hoverTarget.weight = Math.min(Math.max(newWeight, 0), 100) / 100

      // draw info based on new weight
      ctx.clearRect(0, 0, width, height)
      requestAnimationFrame(drawTriangles)
      drawNodeInfo(hoverTarget)
    }
  })

  // initial calculations & triangle drawing
  refreshSize()
}

// refresh size variables on screen resize
function refreshSize() {
  // recalculate size variables
  width = window.innerWidth
  height = window.innerHeight

  // set canvas to new size variables
  c.width = width
  c.height = height

  // redraw triangles
  requestAnimationFrame(drawTriangles)
}

// define triangle variables
let triangle = [
  { x: 0.5, y: 0.2, weight: 0.5 },
  { x: 0.3, y: 0.8, weight: 0.5 },
  { x: 0.7, y: 0.8, weight: 0.5 },
]

let hoverTarget = null, dragTarget = null

// draw triangles containing weighted points
function drawTriangles() {
  // set up stroke
  ctx.strokeStyle = 'rgb(255, 0, 0)'
  ctx.beginPath()

  // move to initial point
  ctx.moveTo(triangle[0].x * width, triangle[0].y * height)

  // go to each point in triangle, drawing line
  for (let i = 1; i < 4; i++) {
    const node = triangle[i % 3]
    ctx.lineTo(node.x * width, node.y * height)
  }
  ctx.stroke()
}

// draw node circle and weight
function drawNodeInfo(node) {
  // stop simulation if it's already running
  running = false
  
  // node circle
  ctx.fillStyle = 'rgb(255, 0, 0)'
  ctx.beginPath()
  ctx.arc(node.x * width, node.y * height, 7, 0, 2*Math.PI)
  ctx.fill()

  // node weight line
  ctx.strokeStyle = 'rgb(0, 0, 255)'
  ctx.beginPath()

  // move to center of triangle
  const centerX = (triangle[0].x + triangle[1].x + triangle[2].x) / 3
  const centerY = (triangle[0].y + triangle[1].y + triangle[2].y) / 3
  ctx.moveTo(centerX * width, centerY * height)
  
  // draw line to node based on weight
  const lineX = node.x + (centerX - node.x) * (1 - node.weight)
  const lineY = node.y + (centerY - node.y) * (1 - node.weight)
  ctx.lineTo(lineX * width, lineY * height)
  ctx.stroke()

  // node text
  ctx.fillStyle = 'rgb(0, 0, 255)'
  ctx.font ='16px monospace'
  ctx.fillText(`Weight: ${node.weight}`, node.x * width - 50, node.y * height - 20)
}

// check if user is hovering over a node
function checkNodeHover(node) {
  // calculate x and y distance to node
  const deltaX = (node.x * width) - mouseX
  const deltaY = (node.y * height) - mouseY

  // determine if mouse is within 10 pixels
  if (deltaX * deltaX + deltaY * deltaY < 100) {
    return true
  }
}

// add one new dot to simulation
function iterate() {
  // iterate 5 times per animation frame
  for (var i = 0; i < iterations; i++) {
    // pick random node
    const node = triangle[Math.floor(Math.random() * 3)]

    // travel based on weight
    simX += ((node.x - simX) * node.weight)
    simY += ((node.y - simY) * node.weight)

    // paint dot at new position
    ctx.beginPath()
    ctx.arc(simX * width, simY * height, radius, 0, 2*Math.PI)
    ctx.fill()
  }

  // run again if simulation is still going
  if (running) {
    requestAnimationFrame(iterate)
  }
}
