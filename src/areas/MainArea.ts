import { Area, AreaState } from 'engine/area';
import { AudioWrapper } from 'engine/audio';
import { Asteroid } from 'entities/Asteroid';
import { SpaceShip } from 'entities/SpaceShip';
import lodash from 'lodash';
import * as THREE from 'three';

export const MIN_PLAYER = -10;
export const MAX_PLAYER = 10;

/**
 * Represents the main area in the game
 */
export class MainArea implements AreaState {
  private camera: THREE.PerspectiveCamera;
  private area: Area<this>;

  // Public sounds
  public shoot: AudioWrapper;
  public hit: AudioWrapper;
  public explosion: AudioWrapper;
  private bgm: AudioWrapper;

  onCreate(area: Area<this>): void {
    this.area = area;

    // Configure the background
    const texture = area.game.assets.getTexture('MilkyWayBG');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    area.scene.background = texture;

    // Configure camera
    this.camera = new THREE.PerspectiveCamera(45, area.game.canvasWidth / area.game.canvasHeight, 1, 1000);
    this.camera.position.set(0, 30, 10);
    this.camera.lookAt(0, 0, 0);
    area.camera = this.camera;

    // Add a static light
    const light = new THREE.DirectionalLight(0xffffff, 10);
    light.position.set(37, 107, -99);
    area.scene.add(light);

    // Load the audio files
    this.shoot = area.createAudio('Shoot');
    this.hit = area.createAudio('Hit');
    this.explosion = area.createAudio('Explosion');
    this.bgm = area.createAudio('BGM');
    this.bgm.play(true);

    // Spawn the main objects
    area.createEntity(new SpaceShip());
    lodash.range(1, 60).forEach(() => area.createEntity(new Asteroid()));
  }

  onTimer(_timerIndex: number): void {}

  onStep(): void {
    // Make sure the camera is scaled properly
    this.camera.aspect = this.area.game.canvasWidth / this.area.game.canvasHeight;
    this.camera.updateProjectionMatrix();
  }

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
