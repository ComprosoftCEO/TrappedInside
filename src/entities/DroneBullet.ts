import { SphereCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';
import { Drone } from './Drone';
import * as THREE from 'three';

const BULLET_MESH = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
BULLET_MESH.scale.set(0.15, 0.15, 0.15);

const MOVEMENT_SPEED = 0.5;
const DESTROY_TICKS = 250;

/**
 * Bullet that is shot from a drone
 */
export class DroneBullet implements EntityState {
  public readonly tags: string[] = ['bullet'];

  private entity: Entity<this>;
  private position: THREE.Vector3;
  private rotation: THREE.Euler;

  constructor(shootFrom: Entity<Drone>) {
    this.position = shootFrom.object.position.clone();
    this.rotation = shootFrom.object.rotation.clone();
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    // Build the object
    const object = BULLET_MESH.clone();
    object.position.copy(this.position);
    object.rotation.copy(this.rotation);
    object.updateMatrix();
    this.entity.object = object;

    // Build the mask
    this.entity.mask = new SphereCollisionMask(this.entity.object);

    // Timer to specify when to destroy the bullet
    this.entity.setTimer(0, DESTROY_TICKS);
  }

  onDestroy(): void {}

  onStep(): void {
    this.entity.object.translateX(MOVEMENT_SPEED);

    this.entity.mask.update(this.entity.object);
    this.testForWallCollision();
  }

  private testForWallCollision() {
    for (const wall of this.entity.area.findEntities('wall')) {
      if (this.entity.isCollidingWith(wall)) {
        this.entity.destroy();
        return;
      }
    }
  }

  onTimer(_timerIndex: number): void {
    this.entity.destroy();
  }

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
