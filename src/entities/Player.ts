import { Entity, EntityState } from 'engine/entity';
import { Key } from 'engine/input';
import { clamp } from 'engine/helpers';
import * as THREE from 'three';
import { BoxCollisionMask } from 'engine/collision';

const ROTATION_SPEED = 0.002;
const MOVEMENT_SPEED = 0.1;
const MAX_VERT_ANGLE = 0.75 * (Math.PI / 2);

const PLAYER_BOX3_MASK = new THREE.Box3(new THREE.Vector3(-0.5, 0, -0.5), new THREE.Vector3(0.5, 3, 0.5));

/**
 * Represents the player in the game
 */
export class Player implements EntityState {
  public readonly tags: string[] = ['player'];

  private entity: Entity<this>;
  private mask: BoxCollisionMask;
  private camera: THREE.PerspectiveCamera;

  private horDir = Math.PI / 2;
  private vertDir = 0;

  onCreate(entity: Entity<this>): void {
    this.entity = entity;
    this.entity.area.game.input.pointerLockEnabled = true;

    // Box mask to detect collisions
    this.mask = new BoxCollisionMask(PLAYER_BOX3_MASK);
    this.entity.mask = this.mask;

    // Build the camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      entity.area.game.canvasWidth / entity.area.game.canvasHeight,
      0.001,
      1000,
    );
    this.camera.position.y = 2;
    this.entity.area.camera = this.camera;
    this.entity.object = this.camera;
  }

  onDestroy(): void {}

  onStep(): void {
    const input = this.entity.area.game.input;

    // Make sure the camera is scaled properly
    this.camera.aspect = this.entity.area.game.canvasWidth / this.entity.area.game.canvasHeight;
    this.camera.updateProjectionMatrix();

    // Test for camera spin
    const mouseX = input.getMouseMovementX();
    if (Math.abs(mouseX) > 2) {
      this.horDir += -mouseX * ROTATION_SPEED;
    }

    // Test for camera vertical up-down
    const mouseY = input.getMouseMovementY();
    if (Math.abs(mouseY) > 2) {
      this.vertDir += -mouseY * ROTATION_SPEED;
      this.vertDir = clamp(this.vertDir, -MAX_VERT_ANGLE, MAX_VERT_ANGLE);
    }

    this.updateCameraRotation();

    // X = Forward (+) and Back (-)
    // Z = Left (-) and Right (+)
    let deltaX = 0,
      deltaZ = 0;
    if (input.isKeyDown(Key.W)) {
      deltaX += MOVEMENT_SPEED;
    }
    if (input.isKeyDown(Key.S)) {
      deltaX -= MOVEMENT_SPEED;
    }
    if (input.isKeyDown(Key.A)) {
      deltaZ += MOVEMENT_SPEED;
    }
    if (input.isKeyDown(Key.D)) {
      deltaZ -= MOVEMENT_SPEED;
    }

    this.updatePosition(deltaX, deltaZ);
  }

  /**
   * Update the camera rotation using the current rotation angles
   */
  private updateCameraRotation(): void {
    const euler = new THREE.Euler(this.vertDir, this.horDir, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);
  }

  /**
   * Update the position of the player
   *
   * @param deltaX Forward (+) and Back (-)
   * @param deltaZ Left (-) and Right (+)
   */
  private updatePosition(deltaX: number, deltaZ: number): void {
    // Must convert local to global axis
    const movementVector = new THREE.Vector3(-deltaZ, 0, -deltaX);
    movementVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.horDir);

    const moveX = new THREE.Vector3(movementVector.x, 0, 0);
    const moveZ = new THREE.Vector3(0, 0, movementVector.z);

    // Try to move along X
    // Undo the move if colliding with walls
    this.mask.box.translate(moveX);
    if (this.isCollidingWithWalls()) {
      this.mask.box.translate(moveX.negate());
    } else {
      this.camera.position.add(moveX);
    }

    // Try to move along Z
    // Undo the move if colliding with walls
    this.mask.box.translate(moveZ);
    if (this.isCollidingWithWalls()) {
      this.mask.box.translate(moveZ.negate());
    } else {
      this.camera.position.add(moveZ);
    }
  }

  /**
   * Test if the player is currently colliding with any walls
   */
  private isCollidingWithWalls(): boolean {
    return this.entity.area.findEntities('wall').some((wall) => this.entity.isCollidingWith(wall));
  }

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
