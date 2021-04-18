import { Area, AreaState } from 'engine/area';
import { AudioWrapper } from 'engine/audio';
import { Player } from 'entities/Player';
import TestMaze from 'assets/levels/TestMaze.lvl';
import { MazeWalls } from 'entities/MazeWalls';
import { MazeFloor } from 'entities/MazeFloor';
import { Door } from 'entities/Door';
import { DoorColor } from 'entities/DoorColor';
import { Key } from 'entities/Key';
import { Drone } from 'entities/Drone';
import { MazeObject, stringToMaze } from './MazeObject';
import * as THREE from 'three';
import { HUD } from 'entities/HUD';

// Size of each tile in the maze (NxN)
export const SCALE_BASE = 5;

// Height of the walls
export const SCALE_HEIGHT = 20;

/**
 * Represents the main area in the game
 */
export class MainArea implements AreaState {
  private area: Area<this>;

  public readonly maze: MazeObject[][];

  // Manage the sunlight
  private light: THREE.DirectionalLight;
  private lightAngle = (Math.PI * 5) / 12;
  private lightDistance: number;

  // Store the last known tile location for the player
  private playerTileLocation: [number, number];
  private playerAngle: number; // Angle in radians

  constructor() {
    this.maze = stringToMaze(TestMaze);
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

  /**
   * Get the last (row, column) position of the player in the maze
   */
  public getPlayerTileLocation(): [number, number] {
    return this.playerTileLocation;
  }

  /**
   * Get the last known angle of the player
   */
  public getPlayerAngle(): number {
    return this.playerAngle;
  }

  onCreate(area: Area<this>): void {
    this.area = area;

    // Configure the background
    const texture = area.game.assets.getTexture('SkyboxBG');
    area.scene.background = texture;

    // Add a static light
    this.light = new THREE.DirectionalLight(0xffffff, 1);
    this.calculateLight();
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

    // for (let i = 0; i < 10; i += 1) {
    //   this.area.scene.add(this.area.game.assets.getObject('Grass').clone());
    // }

    this.area.createEntity(new MazeFloor(this.mazeWidth, this.mazeHeight));
    this.buildMaze();

    // Spawn the main objects
    this.area.createEntity(new HUD());
  }

  /**
   * Compute information about the directional light
   */
  private calculateLight(): void {
    const lightWidth = this.mazeWidth * SCALE_BASE;
    const lightHeight = this.mazeHeight * SCALE_BASE;

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

  /**
   * Build all of the maze objects
   */
  private buildMaze(): void {
    let playerPosition: [number, number] | null = null;

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
        switch (col) {
          case MazeObject.Wall:
            wallEntity.state.addWall(rowIndex, colIndex, this);
            break;

          case MazeObject.Player:
            if (playerPosition === null) {
              playerPosition = [rowIndex, colIndex];
            }
            break;

          case MazeObject.RedDoor:
            this.area.createEntity(new Door(rowIndex, colIndex, DoorColor.Red));
            break;

          case MazeObject.YellowDoor:
            this.area.createEntity(new Door(rowIndex, colIndex, DoorColor.Yellow));
            break;

          case MazeObject.GreenDoor:
            this.area.createEntity(new Door(rowIndex, colIndex, DoorColor.Green));
            break;

          case MazeObject.BlueDoor:
            this.area.createEntity(new Door(rowIndex, colIndex, DoorColor.Blue));
            break;

          case MazeObject.RedKey:
            this.area.createEntity(new Key(rowIndex, colIndex, DoorColor.Red));
            break;

          case MazeObject.YellowKey:
            this.area.createEntity(new Key(rowIndex, colIndex, DoorColor.Yellow));
            break;

          case MazeObject.GreenKey:
            this.area.createEntity(new Key(rowIndex, colIndex, DoorColor.Green));
            break;

          case MazeObject.BlueKey:
            this.area.createEntity(new Key(rowIndex, colIndex, DoorColor.Blue));
            break;

          case MazeObject.Drone:
            this.area.createEntity(new Drone(rowIndex, colIndex));
            break;
        }
      }
    }

    // Create the player, choose center of maze as default position
    if (playerPosition === null) {
      playerPosition = [Math.floor(this.mazeWidth / 2), Math.floor(this.mazeHeight / 2)];
    }
    this.playerTileLocation = playerPosition;
    this.area.createEntity(new Player(playerPosition[0], playerPosition[1]));
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

  onStep(): void {
    this.updatePlayerTileLocationAndAngle();
  }

  /**
   * Update the internal tile location for the player
   */
  private updatePlayerTileLocationAndAngle(): void {
    const player = this.area.findFirstEntity('player');
    if (player === null) {
      return;
    }

    this.playerTileLocation = this.positionToTileLocation(player.object.position);
    this.playerAngle = (player.state as Player).getFacingAngle();
  }

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
