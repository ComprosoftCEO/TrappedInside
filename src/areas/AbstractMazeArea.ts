import { MazeObject } from './MazeObject';
import * as THREE from 'three';

// Size of each tile in the maze (NxN)
export const SCALE_BASE = 5;

// Height of the walls
export const SCALE_HEIGHT = 20;

/**
 * Type of area that stores a maze with methods to interact with it
 */
export abstract class AbstractMazeArea {
  public readonly maze: MazeObject[][];

  constructor(maze: MazeObject[][]) {
    this.maze = maze;
  }

  /**
   * Get number of columns in the maze
   */
  public get mazeWidth(): number {
    return this.maze[0].length;
  }

  /**
   * Get number of rows in the maze
   */
  public get mazeHeight(): number {
    return this.maze.length;
  }

  /**
   * Convert an (row,column) tile location into an absolute X,0,Z position inside the room
   *
   * Output:
   *   X = X
   *   Y = 0
   *   Z = Z
   */
  public tileLocationToPosition(row: number, column: number): THREE.Vector3 {
    const x = row * SCALE_BASE - SCALE_BASE * Math.floor(this.mazeHeight / 2);
    const z = SCALE_BASE * Math.floor(this.mazeWidth / 2) - column * SCALE_BASE;
    return new THREE.Vector3(x, 0, z);
  }

  /**
   * Calculate the Row,Column value given a position
   * @param position
   */
  public positionToTileLocation(position: THREE.Vector3): [number, number] {
    const row = Math.round(position.x / SCALE_BASE) + Math.floor(this.mazeHeight / 2);
    const col = Math.floor(this.mazeWidth / 2) - Math.round(position.z / SCALE_BASE);
    return [row, col];
  }
}
