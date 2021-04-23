import { pickRandomArray } from 'engine/helpers';

/// Used internally by the generator algorithm for the walls
interface Vertex {
  row: number;
  col: number;
}

/**
 * Generates just the walls of the maze
 */
export class MazeWallsGenerator {
  // Store the true width and height
  private width: number;
  private height: number;
  private centerWidth: number;
  private centerHeight: number;

  /// Array of walls
  private walls: boolean[][];

  /**
   * Construct a new wall generatorr
   *
   * @param width Number of center vertices wide, not the true width
   * @param height Number of center vertices tall, not the true height
   * @param centerWidth True width of the center template
   * @param centerHeight True height of the center template
   */
  constructor(width: number, height: number, centerWidth: number, centerHeight: number) {
    this.width = width * 2 + 1;
    this.height = height * 2 + 1;
    this.centerWidth = centerWidth;
    this.centerHeight = centerHeight;
  }

  /**
   * Method that actually generates the random maze
   */
  public generateRandomMaze(): boolean[][] {
    // Create blank maze
    this.walls = Array(this.height)
      .fill(null)
      .map(() =>
        Array(this.width)
          .fill(null)
          .map(() => true),
      );

    this.chiselHoles();
    this.fillCenterTemplate();

    // Actually generate the maze
    const vertices = this.getAllVertices();
    const maze = generate(vertices, isAdjacent, pickRandomArray);
    this.placeVertexWalls(maze);

    return this.walls;
  }

  /**
   * Chisel out the holes of the maze
   *
   * XXXXXXXXX
   * X | | | X
   * X-X-X-X-X
   * X | | | X
   * X-X-X-X-X
   * X | | | X
   * XXXXXXXXX
   */
  private chiselHoles(): void {
    for (let row = 1; row < this.height - 1; row += 2) {
      // const step = Number(!(row % 2)) + 1;
      for (let col = 1; col < this.width - 1; col += 2) {
        this.walls[row][col] = false;
      }
    }
  }

  /**
   * The center template is filled entirely with walls
   */
  private fillCenterTemplate(): void {
    // Shift everything down by one if the height is even and add an extra row of walls
    const topRow = Math.floor((this.height - this.centerHeight) / 2) + Number(!(this.centerHeight % 2));
    const bottomRow = topRow + this.centerHeight + Number(!(this.centerHeight % 2));
    const leftCol = Math.floor((this.width - this.centerWidth) / 2) + Number(!(this.centerWidth % 2));
    const rightCol = leftCol + this.centerWidth + Number(!(this.centerWidth % 2));

    for (let row = topRow; row < bottomRow; row += 1) {
      for (let col = leftCol; col < rightCol; col += 1) {
        this.walls[row][col] = true;
      }
    }
  }

  /**
   * Get all vertices in the maze
   */
  private getAllVertices(): Vertex[] {
    const vertices: Vertex[] = [];
    for (let row = 1; row < this.height - 1; row += 1) {
      for (let col = 1; col < this.width - 1; col += 1) {
        if (!this.walls[row][col]) {
          vertices.push({ row, col });
        }
      }
    }

    return vertices;
  }

  /**
   * Convert the vertices into walls in the maze by chiseling floor tiles
   *
   * @param vertices Map of vertices to convert
   */
  private placeVertexWalls(vertices: Map<Vertex, Vertex[]>) {
    for (const [node, neighbors] of vertices) {
      for (const neighbor of neighbors) {
        const midpointRow = node.row + (neighbor.row - node.row) / 2;
        const midpointCol = node.col + (neighbor.col - node.col) / 2;
        this.walls[midpointRow][midpointCol] = false;
      }
    }
  }
}

/**
 * Generate a perfect maze.
 * Code is from: https://github.com/semibran/maze/blob/master/index.js
 *
 * @param nodes List of all nodes
 * @param adjacent Function that returns true if two nodes are adjacent, or false otherwise
 * @param choose Function to pick a random node
 * @returns Perfect Maze
 */
function generate<T>(nodes: T[], adjacent: (a: T, b: T) => boolean, choose: (nodes: T[]) => T): Map<T, T[]> {
  let node = choose(nodes);
  const stack = [node];
  const maze = new Map<T, T[]>();

  for (const n of nodes) {
    maze.set(n, []);
  }

  while (node) {
    const neighbors = nodes.filter((other) => !maze.get(other).length && adjacent(node, other));
    if (neighbors.length) {
      const neighbor = choose(neighbors);
      maze.get(node).push(neighbor);
      maze.get(neighbor).push(node);
      stack.unshift(neighbor);
      node = neighbor;
    } else {
      stack.shift();
      node = stack[0];
    }
  }

  return maze;
}

/**
 * Test if two vertices are adjacent in the maze
 */
function isAdjacent(a: Vertex, b: Vertex) {
  return Math.abs(b.row - a.row) + Math.abs(b.col - a.col) === 2;
}
