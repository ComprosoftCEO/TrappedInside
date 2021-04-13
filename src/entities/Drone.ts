import { MainArea, SCALE_BASE } from 'areas/MainArea';
import { BoxCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';
import { DroneBullet } from './DroneBullet';
import * as THREE from 'three';

const MAX_RANGE = 40;

/**
 * Drone enemy that flies around the maze
 */
export class Drone implements EntityState {
  public readonly tags: string[] = ['drone'];

  private entity: Entity<this>;

  private row: number;
  private column: number;

  /**
   * Create a drone at a given position inside the maze
   */
  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    const object = entity.area.game.assets.getObject('Drone').clone();
    object.position.copy((entity.area.state as MainArea).tileLocationToPosition(this.row, this.column));
    object.position.y = 5;
    this.entity.object = object;

    this.entity.mask = new BoxCollisionMask(object);
    this.entity.mask.showMask = true;

    this.entity.setTimer(0, 10, true);
  }

  onDestroy(): void {}

  onStep(): void {
    this.entity.mask.update(this.entity.object);
    this.updateMazePosition();

    if (this.canSeePlayer()) {
      this.pointTowardsPlayer();
    } else {
    }
  }

  /**
   * Compute the tile position of the entity in the maze
   */
  private updateMazePosition(): void {
    this.row = Math.floor(this.entity.object.position.x / SCALE_BASE);
    this.column = Math.floor(-this.entity.object.position.z / SCALE_BASE);
  }

  /**
   * Test if the object can see the player
   */
  private canSeePlayer(): boolean {
    const player = this.entity.area.findFirstEntity('player');
    if (player === null) {
      return;
    }

    // Compute a vector from the drone to the player
    const vector = player.object.position.clone();
    vector.sub(this.entity.object.position);

    // Can only see player within a distance
    const distance = vector.length();
    if (distance >= MAX_RANGE) {
      return false;
    }

    // Make sure the ray doesn't collide with any walls
    const raycaster = new THREE.Raycaster(this.entity.object.position, vector.normalize(), 0, distance);
    return this.entity.area.findEntities('wall').every((wall) => {
      const intersection = wall.mask.intersectsRay(raycaster.ray);
      if (intersection === null) {
        return true;
      }

      const rayDistance = intersection.distanceTo(this.entity.object.position);
      return rayDistance >= distance;
    });
  }

  /**
   * Point towards the player
   */
  private pointTowardsPlayer(): void {
    const player = this.entity.area.findFirstEntity('player');
    if (player === null) {
      return;
    }

    const vector = this.entity.object.position.clone();
    vector.sub(player.object.position);

    const horAngle = Math.atan2(-vector.z, vector.x) + Math.PI;
    const horDist = Math.sqrt(vector.z * vector.z + vector.x * vector.x);
    const verAngle = -Math.atan2(vector.y, horDist);

    const euler = new THREE.Euler(0, horAngle, verAngle, 'YXZ');
    this.entity.object.quaternion.setFromEuler(euler);
  }

  onTimer(timerIndex: number): void {
    if (timerIndex === 0 && this.canSeePlayer()) {
      this.entity.area.createEntity(new DroneBullet(this.entity));
    }
  }

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
