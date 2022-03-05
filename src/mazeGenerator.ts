export function generate(width: number, height: number, seed?: number) {
    class Cell {
        public visited = false
        public neighbors: [Cell, Cell, Cell, Cell]

        constructor(public x: number, public y: number, private walls: [boolean, boolean, boolean, boolean] = [true, true, true, true]) {}

        get frontWall() {
            return this.walls[0]
        }
        set frontWall(v: boolean) {
            this.walls[0] = v
        }

        get backWall() {
            return this.walls[1]
        }
        set backWall(v: boolean) {
            this.walls[1] = v
        }

        get leftWall() {
            return this.walls[2]
        }
        set leftWall(v: boolean) {
            this.walls[2] = v
        }

        get rightWall() {
            return this.walls[3]
        }
        set rightWall(v: boolean) {
            this.walls[3] = v
        }

        get unvisitedNeighbors() {
            return this.neighbors.filter((v) => {
                if (v == null) return false

                return !v.visited
            })
        }

        get hasUnvisitedNeighbors() {
            return this.unvisitedNeighbors.length != 0
        }
    }

    function mulberry32(seed: number) {
        return function() {
            let cycle = seed += 0x6D2B79F5;
        
            cycle = Math.imul(cycle ^ cycle >>> 15, cycle | 1);
            cycle ^= cycle + Math.imul(cycle ^ cycle >>> 7, cycle | 61);
            
            return ((cycle ^ cycle >>> 14) >>> 0) / 4294967296;
        }
    }

    const random = mulberry32(seed ?? Date.now())
    const randint = (min: number, max: number) => Math.floor(random() * (max - min) + min)

    const getPosition = (x: number, y: number) => width * y + x
    const getPositionFromIndex = (index: number): [number, number] => [index % width, Math.floor(index / width)]

    let cells = Array(width)
    .fill(undefined)
    .map((_, x) => Array(height)
        .fill(undefined)
        .map((_, y) => new Cell(x, y)))

    cells.forEach((line, x) => {
        line.forEach((v, y) => {
            v.neighbors = [
                cells[x][y-1] || null,
                cells[x][y+1] || null,
                (() => {
                    if (cells[x-1] === undefined) return undefined

                    return cells[x-1][y]
                })() || null,
                (() => {
                    if (cells[x+1] === undefined) return undefined
                    
                    return cells[x+1][y]
                })() || null
            ]
        })
    })

    let unvisited = width * height - 1
    let currentCell = cells[0][0]
    currentCell.visited = true

    let stack: Cell[] = []

    while (unvisited != 0) {
        if (currentCell.hasUnvisitedNeighbors) {
            let unvisitedNeighbors = currentCell.unvisitedNeighbors

            let chosenCell = unvisitedNeighbors[randint(0, unvisitedNeighbors.length)]

            stack.push(currentCell)

            if (currentCell.y - chosenCell.y > 0) {
                currentCell.frontWall = false
                chosenCell.backWall = false
            } else if (currentCell.y - chosenCell.y < 0) {
                currentCell.backWall = false
                chosenCell.frontWall = false
            } else if (currentCell.x - chosenCell.x < 0) {
                currentCell.rightWall = false
                chosenCell.leftWall = false
            } else if (currentCell.x - chosenCell.x > 0) {
                currentCell.leftWall = false
                chosenCell.rightWall = false
            }

            currentCell = chosenCell
            chosenCell.visited = true

            unvisited--
        } else
            currentCell = stack.pop()
    }

    let newCells = []
    for (let line of cells)
        for (let cell of line)
            newCells.push(cell)

    return newCells
}