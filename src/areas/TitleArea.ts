import { Area, AreaState } from 'engine/area';
import { EntityState } from 'engine/entity';
import { MazeObject, stringToMaze } from './MazeObject';
import { MazeWalls } from 'entities/maze-objects/MazeWalls';
import { AbstractMazeArea } from './AbstractMazeArea';
import { Sunlight } from 'entities/effects/Sunlight';
import { MazeFloor } from 'entities/maze-objects/MazeFloor';
import { DummyBigDoor } from 'entities/maze-objects/DummyBigDoor';
import { AudioWrapper } from 'engine/audio';
import { Key, MouseButton } from 'engine/input';
import { MainArea } from './MainArea';
import { StartButton } from 'entities/ui/StartButton';
import Title from 'assets/levels/Title.lvl';
import * as THREE from 'three';

type MazeObjectFunction = (row: number, col: number, area: Area<TitleArea>) => EntityState;
const CONSTRUCTORS: { [K in MazeObject]?: MazeObjectFunction } = {
  [MazeObject.BigDoor]: (row, col) => new DummyBigDoor(row, col),
};

/**
 * Title Screen
 */
export class TitleArea extends AbstractMazeArea implements AreaState {
  private area: Area<this>;

  private camera: THREE.PerspectiveCamera;
  private cameraPos: [number, number] = [0, 0];

  public titleMusic: AudioWrapper;

  constructor() {
    super(stringToMaze(Title));
  }

  onCreate(area: Area<this>): void {
    this.area = area;

    // Build the room
    this.area.createEntity(new MazeFloor(this.mazeWidth, this.mazeHeight));
    this.buildDummyMaze();

    // Configure the background
    const texture = area.game.assets.getTexture('SkyboxBG');
    area.scene.background = texture;

    // Add a static light and enable shadows
    this.area.createEntity(new Sunlight());
    area.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    area.game.renderer.shadowMap.enabled = true;

    // Build the camera
    this.area.game.input.pointerLockEnabled = false;
    this.camera = new THREE.PerspectiveCamera(50, area.game.canvasWidth / area.game.canvasHeight, 0.001, 1000);
    this.area.camera = this.camera;

    // Set the camera position maze
    const position = this.tileLocationToPosition(this.cameraPos[0], this.cameraPos[1]);
    this.camera.position.copy(position);
    this.camera.position.y = 2.5;
    this.camera.position.x -= 2.5;
    this.camera.quaternion.setFromEuler(new THREE.Euler(Math.PI / 30, Math.PI / 2, 0, 'YXZ'));

    // Load any sounds
    this.titleMusic = this.area.createAudio('Title');
    this.titleMusic.play(true);

    // Add the button object
    this.area.createEntity(new StartButton());
  }

  /**
   * Build all of the maze objects
   */
  private buildDummyMaze(): void {
    // Calculate the total number of walls in the maze
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

          case MazeObject.Portal:
            this.cameraPos = [rowIndex, colIndex];
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
  }

  onTimer(_timerIndex: number): void {}

  onStep(): void {
    // Make sure the camera is scaled properly
    this.camera.aspect = this.area.game.canvasWidth / this.area.game.canvasHeight;
    this.camera.updateProjectionMatrix();

    // Fix for audio playing
    const input = this.area.game.input;
    if (input.isMouseButtonDown(MouseButton.Left)) {
      this.titleMusic.audio.context.resume();
    }

    if (input.isKeyStarted(Key.Enter)) {
      this.startGame();
    }
  }

  /**
   * Play the game!
   */
  public startGame(): void {
    this.titleMusic.stop();
    this.area.game.setArea(new MainArea());
  }

  /// Draw the title screen
  onDraw(g2d: CanvasRenderingContext2D): void {
    // Draw the title text
    g2d.font = 'bold 64pt serif';
    g2d.textAlign = 'center';
    g2d.textBaseline = 'top';
    g2d.fillStyle = '#0368ff';
    g2d.fillText('Trapped Inside', this.area.overlayWidth / 2, 20);

    const metrics = g2d.measureText('Trapped Inside');
    g2d.font = '18pt sans-serif';
    g2d.fillStyle = 'white';
    g2d.fillText('Created by Bryan McClain', this.area.overlayWidth / 2, 40 + metrics.actualBoundingBoxDescent);
  }
}
