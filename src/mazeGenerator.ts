/**
 * Generates a maze
 * @param width Width of the maze
 * @param height Height of the maze
 * @param seed Seed used for the random number generator
 * @returns Randomly generated maze
 */
export function generate(width: number, height: number, seed?: number) {
    /**
     * Cell class used for the algorithm
     */
    class Cell {
        /**
         * Has it been visited?
         * 
         * **Used for the algorithm**
         */
        public visited = false
        /**
         * Cell's neighboring cells
         * [front, back, left, right]
         * 
         * **Used for the algorithm**
         */
        public neighbors: [Cell, Cell, Cell, Cell]

        /**
         * Used for constructing a cell
         * @param x x position
         * @param y y position
         * @param walls walls for the cell
         */
        constructor(public x: number, public y: number, private walls: [boolean, boolean, boolean, boolean] = [true, true, true, true]) {}

        // Bunch of these explain themselves
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

        /**
         * Cell's unvisited neighbors
         * 
         * **Used for the algorithm**
         */
        get unvisitedNeighbors() {
            return this.neighbors.filter((v) => {
                if (v == null) return false

                return !v.visited
            })
        }

        /**
         * Does the cell have unvisited neighbors?
         * 
         * **Used for the algorithm**
         */
        get hasUnvisitedNeighbors() {
            return this.unvisitedNeighbors.length != 0
        }
    }

    /**
     * Random number generator I found online lmao
     * @param seed a seed
     * @returns a number generator for generating pseudo-random numbers
     */
    function mulberry32(seed: number) {
        return function() {
            let cycle = seed += 0x6D2B79F5;
        
            cycle = Math.imul(cycle ^ cycle >>> 15, cycle | 1);
            cycle ^= cycle + Math.imul(cycle ^ cycle >>> 7, cycle | 61);
            
            return ((cycle ^ cycle >>> 14) >>> 0) / 4294967296;
        }
    }

    // These explain themselves
    const random = mulberry32(seed ?? Date.now()) // We used the seed or the current time if seed wasn't passed
    const randint = (min: number, max: number) => Math.floor(random() * (max - min) + min)

    // this is garbage
    // const getPosition = (x: number, y: number) => width * y + x
    // const getPositionFromIndex = (index: number): [number, number] => [index % width, Math.floor(index / width)]

    /**
     * Generating the cells at each position
     */
    let cells: Cell[][] = Array(width)
    .fill(undefined)
    .map((_, x) => Array(height)
        .fill(undefined)
        .map((_, y) => new Cell(x, y)))

    /**
     * Setting each cell's neighbors
     */
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

    /**
     * Tracks the number of unvisited cells (subtracts one because at the beginning we already have a visited cell)
     */
    let unvisited = width * height - 1
    /**
     * The current cell
     */
    let currentCell = cells[0][0]
    currentCell.visited = true

    /**
     * The stack, used for backtracking
     */
    let stack: Cell[] = []

    // while there are unvisted cells
    while (unvisited != 0) {
        // if the current cell has unvisited neighbors
        if (currentCell.hasUnvisitedNeighbors) {
            /**
             * current cell's unvisited neighbors
             */
            let unvisitedNeighbors = currentCell.unvisitedNeighbors

            /**
             * chose one of its neighbors
             */
            let chosenCell = unvisitedNeighbors[randint(0, unvisitedNeighbors.length)]

            // Push it to the stack, so we can backtrack to it later
            stack.push(currentCell)

            // Connecting the current and the chosen cell
            // based on where the chosen cell is relative to the current cell
            if (currentCell.y - chosenCell.y > 0) { // Above
                currentCell.frontWall = false
                chosenCell.backWall = false
            } else if (currentCell.y - chosenCell.y < 0) { // Below
                currentCell.backWall = false
                chosenCell.frontWall = false
            } else if (currentCell.x - chosenCell.x < 0) { // Right
                currentCell.rightWall = false
                chosenCell.leftWall = false
            } else if (currentCell.x - chosenCell.x > 0) { // Left
                currentCell.leftWall = false
                chosenCell.rightWall = false
            }

            // we make the chosen cell the current cell and mark it as visited
            currentCell = chosenCell
            chosenCell.visited = true

            // we subract one, because a new one has been visited
            unvisited--
        } else
            // We go back to the previous cell
            // we backtrack lmao
            currentCell = stack.pop()
    }

    // Converts the 2D array to a 1D array
    let newCells: Cell[] = []
    for (let line of cells)
        for (let cell of line)
            newCells.push(cell)

    return newCells
}