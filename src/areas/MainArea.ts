import { Area, AreaState } from 'engine/area';
import { AudioWrapper } from 'engine/audio';
import { Player } from 'entities/Player';
import { MazeWalls } from 'entities/maze-objects/MazeWalls';
import { MazeFloor } from 'entities/maze-objects/MazeFloor';
import { ColorDoor } from 'entities/maze-objects/ColorDoor';
import { DoorColor } from 'entities/DoorColor';
import { Key } from 'entities/maze-objects/Key';
import { Drone } from 'entities/enemies/Drone';
import { MazeObject, stringToMaze } from './MazeObject';
import { HUD } from 'entities/HUD';
import { Health } from 'resources/Health';
import { Inventory } from 'resources/Inventory';
import { Energy } from 'entities/maze-objects/Energy';
import { Lever } from 'entities/maze-objects/Lever';
import { Rock } from 'entities/maze-objects/Rock';
import { Battery } from 'entities/maze-objects/Battery';
import { ElectricBox } from 'entities/maze-objects/ElectricBox';
import { ElectricBoxType } from 'entities/ElectricBoxType';
import { DoorState } from 'resources/DoorState';
import { ToggleDoor } from 'entities/maze-objects/ToggleDoor';
import { ElectricDoor } from 'entities/maze-objects/ElectricDoor';
import { Portal } from 'entities/maze-objects/Portal';
import { BigDoor } from 'entities/maze-objects/BigDoor';
import { MazeGenerator } from 'generator/MazeGenerator';
import { MazeMap } from 'entities/maze-objects/MazeMap';
import { MazeGun } from 'entities/maze-objects/MazeGun';
import { AbstractMazeArea } from './AbstractMazeArea';
import { Sunlight } from 'entities/effects/Sunlight';
import { FadeInEffect } from 'entities/effects/FadeInEffect';
import Template from 'assets/levels/Template.lvl';
import * as THREE from 'three';
import { EntityState } from 'engine/entity';
import { FadeInMainArea } from 'entities/effects/FadeInMainArea';
import { MouseButton } from 'engine/input';

/// Functions to construct all of the objects in the mmaze
type MazeObjectFunction = (row: number, col: number, area: Area<MainArea>) => EntityState;
const CONSTRUCTORS: { [K in MazeObject]?: MazeObjectFunction } = {
  [MazeObject.Rock]: (row, col) => new Rock(row, col),
  [MazeObject.RedDoor]: buildColorDoor(DoorColor.Red),
  [MazeObject.YellowDoor]: buildColorDoor(DoorColor.Yellow),
  [MazeObject.GreenDoor]: buildColorDoor(DoorColor.Green),
  [MazeObject.BlueDoor]: buildColorDoor(DoorColor.Blue),
  [MazeObject.RedKey]: buildKey(DoorColor.Red),
  [MazeObject.YellowKey]: buildKey(DoorColor.Yellow),
  [MazeObject.GreenKey]: buildKey(DoorColor.Green),
  [MazeObject.BlueKey]: buildKey(DoorColor.Blue),
  [MazeObject.Battery]: (row, col) => new Battery(row, col),
  [MazeObject.Lever]: (row, col) => new Lever(row, col),
  [MazeObject.ToggleDoor]: (row, col) => new ToggleDoor(row, col),
  [MazeObject.InverseToggleDoor]: (row, col) => new ToggleDoor(row, col, true),
  [MazeObject.ABox]: buildElectricBox(ElectricBoxType.A),
  [MazeObject.BBox]: buildElectricBox(ElectricBoxType.B),
  [MazeObject.CBox]: buildElectricBox(ElectricBoxType.C),
  [MazeObject.ADoor]: buildElectricDoor(ElectricBoxType.A),
  [MazeObject.BDoor]: buildElectricDoor(ElectricBoxType.B),
  [MazeObject.CDoor]: buildElectricDoor(ElectricBoxType.C),
  [MazeObject.Drone]: (row, col) => new Drone(row, col),
  [MazeObject.BigDoor]: (row, col) => new BigDoor(row, col),
  [MazeObject.Map]: (row, col) => new MazeMap(row, col),
  [MazeObject.Gun]: (row, col) => new MazeGun(row, col),
};

/**
 * Represents the main area in the game
 */
export class MainArea extends AbstractMazeArea implements AreaState {
  private area: Area<this>;

  private _totalEnergy: number;

  // Store the last known tile location for the player
  private playerTileLocation: [number, number];
  private playerAngle: number; // Angle in radians

  // All music and sounds for the main area
  public forestAmbience: AudioWrapper;

  public playerShoot: AudioWrapper;
  public droneShoot: AudioWrapper;
  public hitObject: AudioWrapper;
  public oofSound: AudioWrapper;
  public collectItem: AudioWrapper;
  public openDoor: AudioWrapper;
  public openBigDoor: AudioWrapper;
  public toggleLever: AudioWrapper;
  public electricBox: AudioWrapper;
  public explosion: AudioWrapper;
  public activatePortal: AudioWrapper;
  public enterPortal: AudioWrapper;

  constructor() {
    super(MainArea.generateNewMaze());
  }

  /**
   * Generate a new random maze
   */
  private static generateNewMaze(): MazeObject[][] {
    const generator = new MazeGenerator(13, 13, stringToMaze(Template));
    return generator.generateMaze();
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

  /**
   * Get the total number of energy balls in the maze
   */
  public get totalEnergy(): number {
    return this._totalEnergy;
  }

  /**
   * Get the number of energy balls left
   */
  public get energyLeft(): number {
    return this.area.findEntities('energy').length;
  }

  onCreate(area: Area<this>): void {
    this.area = area;

    // Configure the background
    const texture = area.game.assets.getTexture('SkyboxBG');
    area.scene.background = texture;

    // Add a static light and enable shadows
    this.area.createEntity(new Sunlight());
    area.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    area.game.renderer.shadowMap.enabled = true;

    // Load the audio files
    this.forestAmbience = area.createAudio('ForestAmbience');
    this.playerShoot = area.createAudio('PlayerShoot');
    this.droneShoot = area.createAudio('DroneShoot');
    this.hitObject = area.createAudio('HitObject');
    this.oofSound = area.createAudio('Oof');
    this.collectItem = area.createAudio('CollectItem');
    this.openDoor = area.createAudio('OpenDoor');
    this.openBigDoor = area.createAudio('OpenBigDoor');
    this.toggleLever = area.createAudio('ToggleLever');
    this.electricBox = area.createAudio('ElectricBox');
    this.explosion = area.createAudio('Explosion');
    this.activatePortal = area.createAudio('ActivatePortal');
    this.enterPortal = area.createAudio('EnterPortal');

    // Play the background music
    this.forestAmbience.volume = 0;
    this.forestAmbience.play(true);

    // Configure game resources
    this.area.game.resources.setResource('health', new Health());
    this.area.game.resources.setResource('inventory', new Inventory());
    this.area.game.resources.setResource('door-state', new DoorState());

    // Build the room
    this.area.createEntity(new MazeFloor(this.mazeWidth, this.mazeHeight));
    this.buildMaze();

    // Spawn the main objects
    this.area.createEntity(new HUD());
    this.area.createEntity(new FadeInMainArea());
  }

  /**
   * Build all of the maze objects
   */
  private buildMaze(): void {
    let playerPosition: [number, number] | null = null;

    // Calculate the total number of walls in the maze
    const numWalls = this.maze.reduce(
      (n, row) => n + row.reduce((n, cell) => n + Number(cell === MazeObject.Wall), 0),
      0,
    );

    // Stores all maze walls inside a single entity
    const wallEntity = this.area.createEntity(new MazeWalls(numWalls, this.area));

    // Create all of the instances in the maze
    let totalEnergy = 0;
    for (const [rowIndex, row] of this.maze.entries()) {
      for (const [colIndex, col] of row.entries()) {
        switch (col) {
          case MazeObject.Wall:
            wallEntity.state.addWall(rowIndex, colIndex, this);
            break;

          case MazeObject.Energy:
            totalEnergy += 1;
            this.area.createEntity(new Energy(rowIndex, colIndex));
            break;

          case MazeObject.Portal:
            if (playerPosition === null) {
              playerPosition = [rowIndex, colIndex];
              this.area.createEntity(new Portal(rowIndex, colIndex));
            }
            break;

          default: {
            const construct = CONSTRUCTORS[col];
            if (typeof construct !== 'undefined') {
              this.area.createEntity(construct(rowIndex, colIndex, this.area));
            }
            break;
          }
        }
      }
    }

    this._totalEnergy = totalEnergy;

    // Create the player, choose center of maze as default position
    if (playerPosition === null) {
      playerPosition = [Math.floor(this.mazeWidth / 2), Math.floor(this.mazeHeight / 2)];
    }
    this.playerTileLocation = playerPosition;
    this.area.createEntity(new Player(playerPosition[0], playerPosition[1]));
  }

  onTimer(_timerIndex: number): void {}

  onStep(): void {
    this.updatePlayerTileLocationAndAngle();

    // Fix for audio playing
    const input = this.area.game.input;
    if (input.isMouseButtonDown(MouseButton.Left)) {
      this.forestAmbience.audio.context.resume();
    }
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

function buildColorDoor(color: DoorColor): MazeObjectFunction {
  return (row, col) => new ColorDoor(row, col, color);
}

function buildKey(color: DoorColor): MazeObjectFunction {
  return (row, col) => new Key(row, col, color);
}

function buildElectricBox(type: ElectricBoxType): MazeObjectFunction {
  return (row, col) => new ElectricBox(row, col, type);
}

function buildElectricDoor(type: ElectricBoxType): MazeObjectFunction {
  return (row, col) => new ElectricDoor(row, col, type);
}
