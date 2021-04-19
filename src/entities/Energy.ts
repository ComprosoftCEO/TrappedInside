import { MainArea } from 'areas/MainArea';
import { MazeObject } from 'areas/MazeObject';
import { BoxCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';
import * as THREE from 'three';

const ENERGY_GEOMETRY = new THREE.IcosahedronGeometry(1, 3);
const ENERGY_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0xff8000,
  emissive: 0xff0000,
});

const SCALE_SPEED = Math.PI / 24;
const MAX_SCALE = 0.1;

/**
 * Energy that needs to be collected to power the exit portal
 */
export class Energy implements EntityState {
  public readonly tags: string[] = ['energy'];

  private entity: Entity<this>;

  private row: number;
  private column: number;
  private scale = 0;

  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    const object = new THREE.Mesh(ENERGY_GEOMETRY, ENERGY_MATERIAL);
    object.position.copy((entity.area.state as MainArea).tileLocationToPosition(this.row, this.column));
    object.position.y = 2.5;
    object.castShadow = true;

    this.entity.object = object;
    this.entity.mask = new BoxCollisionMask(object);
  }

  onDestroy(): void {
    const mainArea = this.entity.area.state as MainArea;
    mainArea.maze[this.row][this.column] = MazeObject.Empty;
  }

  onStep(): void {
    this.playScaleAnimation();
    this.checkForPlayerCollision();
  }

  /**
   * Scale the energy to make it look cool
   */
  private playScaleAnimation(): void {
    const newScale = 1 + MAX_SCALE * Math.sin(this.scale);
    this.scale += SCALE_SPEED;
    this.entity.object.scale.set(newScale, newScale, newScale);
    this.entity.mask.update(this.entity.object);
  }

  /**
   * Destroy this object if it is colliding with the player
   */
  private checkForPlayerCollision(): void {
    const player = this.entity.area.findFirstEntity('player');
    if (player !== null && this.entity.isCollidingWith(player)) {
      this.entity.destroy();
    }
  }

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
