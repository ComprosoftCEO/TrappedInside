import { Area, AreaState } from 'engine/area';
import { AudioWrapper } from 'engine/audio';
import { Player } from 'entities/Player';
import * as THREE from 'three';

/**
 * Represents the main area in the game
 */
export class MainArea implements AreaState {
  private area: Area<this>;

  // Public sounds
  public shoot: AudioWrapper;
  public hit: AudioWrapper;
  public explosion: AudioWrapper;
  private bgm: AudioWrapper;

  onCreate(area: Area<this>): void {
    this.area = area;

    // Configure the background
    const texture = area.game.assets.getTexture('SkyboxBG');
    area.scene.background = texture;

    // Add the plane
    const planeTexture = area.game.assets.getTexture('GrassTexture').clone();
    planeTexture.needsUpdate = true;
    planeTexture.wrapS = THREE.RepeatWrapping;
    planeTexture.wrapT = THREE.RepeatWrapping;
    planeTexture.repeat.set(100, 100);
    console.log(planeTexture);

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial({ map: planeTexture }));
    plane.rotation.x = (3 * Math.PI) / 2;
    plane.scale.set(100, 100, 1);
    area.scene.add(plane);

    // Add a static light
    const light = new THREE.DirectionalLight(0xffffff, 10);
    light.position.set(37, 107, -99);
    area.scene.add(light);

    // Load the audio files
    // this.shoot = area.createAudio('Shoot');
    // this.hit = area.createAudio('Hit');
    // this.explosion = area.createAudio('Explosion');
    // this.bgm = area.createAudio('BGM');
    // this.bgm.play(true);

    // Spawn the main objects
    this.area.createEntity(new Player());
  }

  onTimer(_timerIndex: number): void {}

  onStep(): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
