import { MazeObject } from 'areas/MazeObject';
import { MainPathGenerator } from './MainPathGenerator';
import { MazeWallsGenerator } from './MazeWallsGenerator';
import { buildTreeNodes, TreeNode } from './TreeNode';

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

  private get templateWidth(): number {
    return this.centerTemplate[0].length;
  }

  private get templateHeight(): number {
    return this.centerTemplate.length;
  }

  /**
   * Complicated method to actually generate the maze
   */
  public generateMaze(): MazeObject[][] {
    const generator = new MazeWallsGenerator(this.width, this.height, this.templateWidth, this.templateHeight);
    const walls = generator.generateRandomMaze();

    const objects: MazeObject[][] = walls.map((row) => row.map((col) => (col ? MazeObject.Wall : MazeObject.Empty)));
    this.fillTemplate(objects);

    // Convert the maze walls into a tree
    const [rootRow, rootCol] = this.getRootNode();
    const nodes = buildTreeNodes(walls, rootRow, rootCol);

    // Generate the main path in the tree
    const mainPathGenerator = new MainPathGenerator(nodes);
    mainPathGenerator.generateMainPath();
    MazeGenerator.loadNodes(objects, nodes);

    return objects;
  }

  /**
   * Find the root node from the template by searching for the big door.
   * ONLY searches the perimeter to find it.
   *
   * If no big door is found, then it returns the center above the top door.
   */
  private getRootNode(): [number, number] {
    const topRow = this.getTemplateTopRow();
    const bottomRow = topRow + this.templateHeight - 1;
    const leftCol = this.getTemplateLeftColumn();
    const rightCol = leftCol + this.templateWidth - 1;

    // Top row
    for (let col = 0; col < this.templateWidth; col += 1) {
      if (this.centerTemplate[0][col] === MazeObject.BigDoor) {
        return [topRow - 1, leftCol + col];
      }
    }

    // Bottom row
    for (let col = 0; col < this.templateWidth; col += 1) {
      if (this.centerTemplate[this.templateHeight - 1][col] === MazeObject.BigDoor) {
        return [bottomRow + 1, leftCol + col];
      }
    }

    // Left column
    for (let row = 0; row < this.templateHeight; row += 1) {
      if (this.centerTemplate[row][0] === MazeObject.BigDoor) {
        return [topRow + row, leftCol - 1];
      }
    }

    // Right column
    for (let row = 0; row < this.templateHeight; row += 1) {
      if (this.centerTemplate[row][this.templateWidth - 1] === MazeObject.BigDoor) {
        return [topRow + row, rightCol + 1];
      }
    }

    // By default, return the center above the top row
    return [topRow - 1, leftCol + Math.floor(this.templateWidth / 2)];
  }

  /**
   * Compute the absoute top row for the template
   */
  private getTemplateTopRow(): number {
    return Math.floor((2 * this.height + 1 - this.templateHeight) / 2) + Number(!(this.templateHeight % 2));
  }

  /**
   * Compute the absoute left column for the template
   */
  private getTemplateLeftColumn(): number {
    return Math.floor((2 * this.width + 1 - this.templateWidth) / 2) + Number(!(this.templateWidth % 2));
  }

  /**
   * Fill in the template objects into the maze
   */
  private fillTemplate(objects: MazeObject[][]): void {
    // Shift everything down by one if the height is even, and add an extra row of walls
    const topRow = this.getTemplateTopRow();
    const bottomRow = topRow + this.templateHeight;
    const leftCol = this.getTemplateLeftColumn();
    const rightCol = leftCol + this.templateWidth;

    for (let row = topRow; row < bottomRow; row += 1) {
      for (let col = leftCol; col < rightCol; col += 1) {
        objects[row][col] = this.centerTemplate[row - topRow][col - leftCol];
      }
    }
  }

  /**
   * Recursively load the nodes into the maze
   */
  private static loadNodes(maze: MazeObject[][], node: TreeNode): void {
    maze[node.row][node.column] = node.object;
    for (const child of node.children) {
      this.loadNodes(maze, child);
    }
  }
}
