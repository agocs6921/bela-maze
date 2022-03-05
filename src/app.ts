import { BackSide, BoxGeometry, DoubleSide, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, TextureLoader, Vector3, WebGLRenderer } from "three"
import { generate } from "./mazeGenerator"

const deg2rad = (deg: number) => deg * (Math.PI/180)
const rad2deg = (rad: number) => rad * (180/Math.PI)

const CAMERA = new PerspectiveCamera(90, window.innerWidth / window.innerHeight)
const SCENE = new Scene()

const RENDERER = new WebGLRenderer({ antialias: true })
RENDERER.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(RENDERER.domElement)

let previousTime = new Date().getTime()
RENDERER.setAnimationLoop(() => {
    update(previousTime - new Date().getTime())
    
    RENDERER.render(SCENE, CAMERA)

    previousTime = new Date().getTime()
})

window.addEventListener("resize", updateRenderer)

function updateRenderer() {
    CAMERA.aspect = window.innerWidth / window.innerHeight
    CAMERA.updateProjectionMatrix()

    RENDERER.setSize(window.innerWidth, window.innerHeight)
}

let degree = 0
function update(delta: number) {
    CAMERA.position.x = x / 1.5 * Math.sin(deg2rad(degree)) + x / 2
    CAMERA.position.z = y / 1.5 * Math.cos(deg2rad(degree)) + y / 2

    //CAMERA.rotation.y = deg2rad(degree)
    CAMERA.lookAt(new Vector3(x / 2, 0, y / 2))

    SKYBOX.position.set(CAMERA.position.x, CAMERA.position.y, CAMERA.position.z)

    degree += .5
}

const [x, y] = [8, 8]

let maze = generate(x, y)

CAMERA.position.x = x / 2
CAMERA.position.y = ((x + y) / 2) * .5
CAMERA.position.z = y

// CAMERA.rotation.x = 0

let susmak = new TextureLoader().load("./img/susmak.png")

const WALLMATERIAL = new MeshBasicMaterial({
    color: 0xffffff,
    map: susmak,
    side: DoubleSide
})
const WALLGEOMETRY = new PlaneGeometry(1, 1)

const SKYBOX = new Mesh(new BoxGeometry(2000, 2000, 2000), new MeshBasicMaterial({
    color: 0xffffff,
    map: susmak,
    side: BackSide
}))

SCENE.add(SKYBOX)

SCENE.add((() => {
    let floor = new Mesh(new PlaneGeometry(x, y), WALLMATERIAL)

    floor.position.x = x / 2 - .5
    floor.position.y = -.5
    floor.position.z = y / 2 - .5

    floor.rotation.x = deg2rad(90)

    return floor
})())

for (let i = 0; i < maze.length; i++) {
    let cell = maze[i]
    
    let walls: Mesh[] = []
    
    if (cell.frontWall ) {
        let wall = new Mesh(WALLGEOMETRY, WALLMATERIAL)
        wall.position.set(cell.x, 0, cell.y - .5)
        walls.push(wall)
    }
    if ( cell.backWall ) {
        let wall = new Mesh(WALLGEOMETRY, WALLMATERIAL)
        wall.position.set(cell.x, 0, cell.y + .5)
        walls.push(wall)
    }
    if (cell.leftWall ) {
        let wall = new Mesh(WALLGEOMETRY, WALLMATERIAL)
        wall.position.set(cell.x - .5, 0, cell.y)
        wall.rotation.y = deg2rad(90)
        walls.push(wall)
    }
    if (cell.rightWall ) {
        let wall = new Mesh(WALLGEOMETRY, WALLMATERIAL)
        wall.position.set(cell.x + .5, 0, cell.y)
        wall.rotation.y = deg2rad(90)
        walls.push(wall)
    }
    
    SCENE.add(...walls)
}