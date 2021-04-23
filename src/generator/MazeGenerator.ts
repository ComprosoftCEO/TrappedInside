import { MazeObject } from 'areas/MazeObject';
import { MazeWallsGenerator } from './MazeWallsGenerator';

/**
 * Procedural algorithm to generate random mazes
 */
export class MazeGenerator {
  // Maze parameters that can be varied
  public width: number;
  public height: number;
  public centerTemplate: MazeObject[][];

  // Internal variables for the generator
  private mazeWidth: number; /* True width of maze objects */
  private mazeHeight: number; /* True height of maze objects */

  constructor(width: number, height: number, centerTemplate: MazeObject[][]) {
    this.width = width;
    this.height = height;
    this.centerTemplate = centerTemplate;
  }

  private get centerWidth(): number {
    return this.centerTemplate[0].length;
  }

  private get centerHeight(): number {
    return this.centerTemplate.length;
  }

  /**
   * Complicated method to actually generate the maze
   */
  public generateMaze(): MazeObject[][] {
    const generator = new MazeWallsGenerator(this.width, this.height, this.centerWidth, this.centerHeight);
    const walls = generator.generateRandomMaze();

    const objects: MazeObject[][] = walls.map((row) => row.map((col) => (col ? MazeObject.Wall : MazeObject.Empty)));
    this.fillTemplate(objects);

    return objects;
  }

  /**
   * Fill in the template objects into the maze
   */
  private fillTemplate(objects: MazeObject[][]): void {
    // Shift everything down by one if the height is even, and add an extra row of walls
    const topRow = Math.floor((2 * this.height + 1 - this.centerHeight) / 2) + Number(!(this.centerHeight % 2));
    const bottomRow = topRow + this.centerHeight;
    const leftCol = Math.floor((2 * this.width + 1 - this.centerWidth) / 2) + Number(!(this.centerWidth % 2));
    const rightCol = leftCol + this.centerWidth;

    for (let row = topRow; row < bottomRow; row += 1) {
      for (let col = leftCol; col < rightCol; col += 1) {
        objects[row][col] = this.centerTemplate[row - topRow][col - leftCol];
      }
    }
  }
}
