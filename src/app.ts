import { BackSide, BoxGeometry, DoubleSide, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, TextureLoader, Vector3, WebGLRenderer } from "three"
import { generate } from "./mazeGenerator"

const deg2rad = (deg: number) => deg * (Math.PI/180)
const rad2deg = (rad: number) => rad * (180/Math.PI)

/**
 * Camera to render the scene with with
 */
const CAMERA = new PerspectiveCamera(90, window.innerWidth / window.innerHeight)
/**
 * The scene mentioned before
 */
const SCENE = new Scene() 

/**
 * The renderer used for rendering the scene
 */
const RENDERER = new WebGLRenderer({ antialias: true })
RENDERER.setSize(window.innerWidth, window.innerHeight) // Setting the renderer size to the viewport to get full coverage
document.body.appendChild(RENDERER.domElement) // Adding the renderer's canvas(the element that displays everything)

// Needed for calculating delta because the builtin time for the animation loop is fucked, somehow
let previousTime = new Date().getTime()
RENDERER.setAnimationLoop(() => {
    /**
     * Calculating the difference, aka the delta(the time between the current frame and the previous frame)
     * and then pass it in for the update function, just like in game engines
     */
    update(new Date().getTime() - previousTime)
    
    RENDERER.render(SCENE, CAMERA) // Rendering the scene

    // Setting it so we can calculate it again later
    previousTime = new Date().getTime()
})

// We need this because if we don't do this
// the rendering will be fucked up
window.addEventListener("resize", updateRenderer)

/**
 * Updates the renderer and camera aspects because
 * it gets funky if we don't
 */
function updateRenderer() {
    CAMERA.aspect = window.innerWidth / window.innerHeight
    CAMERA.updateProjectionMatrix()

    RENDERER.setSize(window.innerWidth, window.innerHeight)
}

// Degrees so we can rotate it around the maze
let degree = 0

/**
 * Updating things, duh
 * @param delta time between the last frame and the current
 */
function update(delta: number) {
    // We set the positions of the camera, so it goes in a circle around the maze
    // You just need to calculate the points with sin and cos to get the position
    // and then some offset so it actually rotates around the maze
    CAMERA.position.x = x / 1.5 * Math.sin(deg2rad(degree)) + x / 2
    CAMERA.position.z = y / 1.5 * Math.cos(deg2rad(degree)) + y / 2

    // The method name explains itself
    CAMERA.lookAt(new Vector3(x / 2, 0, y / 2))

    // We set the skyboxes position to the camera's... why? idk
    SKYBOX.position.set(CAMERA.position.x, CAMERA.position.y, CAMERA.position.z)

    // We add some to the degree, why? Because you can't just add to the position and expect the same result...
    // you could but I have no patience for that
    degree += .5
}

// Dimensions for the maze
const [x, y] = [8, 8]

// Generating the maze, duh
let maze = generate(x, y)

// Setting the position of the camera so it is slightly above the maze
CAMERA.position.y = ((x + y) / 2) * .5

// We load bela
let susmak = new TextureLoader().load("./img/susmak.png")

// Make the material for the walls
const WALLMATERIAL = new MeshBasicMaterial({
    color: 0xffffff,
    map: susmak,
    side: DoubleSide
})
// We get the wall geometry
const WALLGEOMETRY = new PlaneGeometry(1, 1)

/**
 * The skybox, there's no need to explain this one
 */
const SKYBOX = new Mesh(new BoxGeometry(2000, 2000, 2000), new MeshBasicMaterial({
    color: 0xffffff,
    map: susmak,
    side: BackSide
}))
// We add the skybox to the scene
SCENE.add(SKYBOX)

// and we add the floor like this,
// why? because we don't need its reference, manipulation not needed
SCENE.add((() => {
    // We create a plane with the same size as the maze and add bela
    let floor = new Mesh(new PlaneGeometry(x, y), WALLMATERIAL)

    // Positioning the floor so it is below the maze
    floor.position.x = x / 2 - .5
    floor.position.y = -.5
    floor.position.z = y / 2 - .5

    // By default, planes stand upward
    // so we have to rotate it by 90 degrees
    floor.rotation.x = deg2rad(90)

    return floor
})())

// We generate the walls for each cell in the maze
for (let i = 0; i < maze.length; i++) {
    // The cell to generate
    let cell = maze[i]
    
    // The walls so we can add them later when the loop is done
    let walls: Mesh[] = []
    
    if (cell.frontWall ) {
        // The wall, with the plane geometry and bela
        let wall = new Mesh(WALLGEOMETRY, WALLMATERIAL)
        // Setting the position so it generates like normally
        wall.position.set(cell.x, 0, cell.y - .5)
        // Adding it to the walls
        walls.push(wall)
    }
    if ( cell.backWall ) {
        // The wall, with the plane geometry and bela
        let wall = new Mesh(WALLGEOMETRY, WALLMATERIAL)
        // Setting the position so it generates like normally
        wall.position.set(cell.x, 0, cell.y + .5)
        // Adding it to the walls
        walls.push(wall)
    }
    if (cell.leftWall ) {
        // The wall, with the plane geometry and bela
        let wall = new Mesh(WALLGEOMETRY, WALLMATERIAL)
        // Setting the position so it generates like normally
        wall.position.set(cell.x - .5, 0, cell.y)
        // Rotating it so it actually looks like a wall facing left
        wall.rotation.y = deg2rad(90)
        // Adding it to the walls
        walls.push(wall)
    }
    if (cell.rightWall ) {
        // The wall, with the plane geometry and bela
        let wall = new Mesh(WALLGEOMETRY, WALLMATERIAL)
        // Setting the position so it generates like normally
        wall.position.set(cell.x + .5, 0, cell.y)
        // Rotating it so it actually looks like a wall facing right
        wall.rotation.y = deg2rad(90)
        // Adding it to the walls
        walls.push(wall)
    }
    
    // Adding the walls in the scene
    SCENE.add(...walls)
}