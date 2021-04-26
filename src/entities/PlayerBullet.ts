import { MainArea } from 'areas/MainArea';
import { SphereCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';
import * as THREE from 'three';

const MOVEMENT_SPEED = 0.8;
const DESTROY_TICKS = 250;

const BULLET_MESH = new THREE.Mesh(new THREE.CylinderGeometry(), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
BULLET_MESH.scale.set(0.1, 2, 0.1);

/**
 * Bullet that is shot from the player object
 */
export class PlayerBullet implements EntityState {
  public readonly tags: string[] = ['player-bullet'];

  private entity: Entity<this>;
  private position: THREE.Vector3;
  private rotation: THREE.Vector3;

  constructor(shootFrom: THREE.Object3D, direction: THREE.Vector3) {
    this.position = shootFrom.getWorldPosition(new THREE.Vector3());
    this.rotation = direction;
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    // Build the object
    const object = BULLET_MESH.clone();
    object.position.copy(this.position);
    object.rotation.setFromVector3(this.rotation);
    object.updateMatrix();
    object.rotateZ(Math.PI / 2);
    object.translateY(-0.8);
    this.entity.object = object;

    // Build the mask
    this.entity.mask = new SphereCollisionMask(this.entity.object);

    // Timer to specify when to destroy the bullet
    this.entity.setTimer(0, DESTROY_TICKS);
  }

  onDestroy(): void {}

  onStep(): void {
    this.entity.object.translateY(-MOVEMENT_SPEED);
    this.entity.mask.update(this.entity.object);
    (this.entity.mask as SphereCollisionMask).sphere.radius /= 6;

    this.testForWallCollision();
  }

  /**
   * Destroy a bullet if it hits a wall
   */
  private testForWallCollision() {
    if (this.isCollidingWithWalls()) {
      this.entity.destroy();
    }
  }

  /**
   * Test if the entity is colliding with any walls
   */
  private isCollidingWithWalls(): boolean {
    return this.entity.area.findEntities('wall').some((wall) => this.entity.isCollidingWith(wall));
  }

  onTimer(_timerIndex: number): void {
    this.entity.destroy();
  }

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
