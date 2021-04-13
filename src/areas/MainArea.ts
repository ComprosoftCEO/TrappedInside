import { Area, AreaState } from 'engine/area';
import { AudioWrapper } from 'engine/audio';
import { Player } from 'entities/Player';
import * as THREE from 'three';
import TestMaze from 'assets/levels/TestMaze.lvl';
import { MazeWalls } from 'entities/MazeWalls';
import { MazeFloor } from 'entities/MazeFloor';

// Size of each tile in the maze (NxN)
export const SCALE_BASE = 5;

// Height of the walls
export const SCALE_HEIGHT = 20;

export enum MazeObject {
  Empty,
  Wall,
}

const MAZE_OBJECT_LOOKUP: Record<string, MazeObject> = {
  [' ']: MazeObject.Empty,
  ['#']: MazeObject.Wall,
};

/**
 * Represents the main area in the game
 */
export class MainArea implements AreaState {
  private area: Area<this>;

  public readonly maze: MazeObject[][] = [];

  private light: THREE.DirectionalLight;
  private lightAngle = (Math.PI * 5) / 12;
  private lightDistance: number;

  public get mazeWidth(): number {
    return this.maze[0].length;
  }

  public get mazeHeight(): number {
    return this.maze.length;
  }

  constructor() {
    this.maze = MainArea.stringToLevel(TestMaze);
    this.light = new THREE.DirectionalLight(0xffffff, 1);
    this.calculateLight();
  }

  /**
   * Compute information about the directional light
   */
  private calculateLight(): void {
    const lightWidth = this.mazeWidth * SCALE_BASE;
    const lightHeight = this.mazeHeight * SCALE_BASE;
    console.log(lightWidth, lightHeight);

    this.light.castShadow = true;

    this.light.shadow.camera.top = lightHeight / 2;
    this.light.shadow.camera.bottom = -lightHeight / 2;
    this.light.shadow.camera.left = -lightWidth / 2;
    this.light.shadow.camera.right = lightWidth / 2;

    // We want light to cover scene when at the 45 degree angle
    //
    //                            Light
    //                              |
    // L          [Center] - - - - -R
    this.lightDistance = lightWidth / Math.cos(Math.PI / 4);
    this.updateLightAngle();
  }

  onCreate(area: Area<this>): void {
    this.area = area;

    // Configure the background
    const texture = area.game.assets.getTexture('SkyboxBG');
    area.scene.background = texture;

    // Add a static light
    area.scene.add(this.light);
    area.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Enable shadows
    area.game.renderer.shadowMap.enabled = true;
    this.area.setTimer(0, 1000, true);

    // Load the audio files
    // this.shoot = area.createAudio('Shoot');
    // this.hit = area.createAudio('Hit');
    // this.explosion = area.createAudio('Explosion');
    // this.bgm = area.createAudio('BGM');
    // this.bgm.play(true);

    this.area.createEntity(new MazeFloor(this.mazeWidth, this.mazeHeight));
    this.buildMaze();

    // Spawn the main objects
    this.area.createEntity(new Player());
  }

  /**
   * Map a string to an array of maze objects
   */
  private static stringToLevel(input: string): MazeObject[][] {
    // Split by newlines
    const lines = input.split(/\r?\n/);

    // Figure out the longest line
    let maxLength = 0;
    for (const line of lines) {
      maxLength = Math.max(maxLength, line.length);
    }

    const result: MazeObject[][] = [];
    for (const line of lines) {
      const mazeRow: MazeObject[] = [];
      for (const char of line) {
        const lookup = MAZE_OBJECT_LOOKUP[char];
        if (typeof lookup === 'undefined') {
          mazeRow.push(MazeObject.Empty);
        } else {
          mazeRow.push(lookup);
        }
      }

      // Make sure all lines are the same length
      while (mazeRow.length < maxLength) {
        mazeRow.push(MazeObject.Empty);
      }

      result.push(mazeRow);
    }

    return result;
  }

  /**
   * Add a ground plane to the bottom of the maze
   */
  private buildGround(): void {
    const width = this.mazeWidth;
    const height = this.mazeHeight;

    // Load and initialize the texture
    const planeTexture = this.area.game.assets.getTexture('GrassTexture');
    planeTexture.wrapS = THREE.RepeatWrapping;
    planeTexture.wrapT = THREE.RepeatWrapping;
    planeTexture.repeat.set(width * SCALE_BASE, height * SCALE_BASE);

    // Build the plane object
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial({ map: planeTexture }));
    plane.rotation.x = (3 * Math.PI) / 2;
    plane.scale.set(width * SCALE_BASE + 2, height * SCALE_BASE + 2, 1);
    this.area.scene.add(plane);
  }

  /**
   * Build all of the maze objects
   */
  private buildMaze(): void {
    // Calcualte the total number of walls in the maze
    const numWalls = this.maze.reduce(
      (n, row) => n + row.reduce((n, cell) => n + Number(cell === MazeObject.Wall), 0),
      0,
    );

    // Stores all maze walls inside a single entity
    const wallEntity = this.area.createEntity(new MazeWalls(numWalls, this.area));

    // Create all of the instances in the maze
    for (const [rowIndex, row] of this.maze.entries()) {
      for (const [colIndex, col] of row.entries()) {
        if (col === MazeObject.Wall) {
          wallEntity.state.addWall(rowIndex, colIndex);
        }
      }
    }
  }

  onTimer(timerIndex: number): void {
    if (timerIndex === 0) {
      this.lightAngle += Math.PI / 64;
      this.lightAngle %= 2 * Math.PI;
      this.updateLightAngle();
    }
  }

  /**
   * Update the angle of the sunlight in the scene
   */
  private updateLightAngle(): void {
    this.light.position.x = 0;
    this.light.position.y = this.lightDistance * Math.sin(this.lightAngle);
    this.light.position.z = -this.lightDistance * Math.cos(this.lightAngle);
    this.light.visible = this.lightAngle <= Math.PI;
  }

  onStep(): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
