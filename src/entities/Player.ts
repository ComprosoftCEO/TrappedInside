import { Entity, EntityState } from 'engine/entity';
import { Key, MouseButton } from 'engine/input';
import { clamp, wrapNumber } from 'engine/helpers';
import * as THREE from 'three';
import { BoxCollisionMask } from 'engine/collision';
import { MainArea } from 'areas/MainArea';
import { DeathAnimation } from './DeathAnimation';
import { Health } from 'resources/Health';
import { PlayerBullet } from './PlayerBullet';

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
  private gun: THREE.Object3D;

  private startRow: number;
  private startCol: number;

  private horDir = Math.PI / 2;
  private vertDir = 0;

  constructor(startRow: number, startCol: number) {
    this.startRow = startRow;
    this.startCol = startCol;
  }

  /**
   * Get the angle that the player is facing
   */
  public getFacingAngle(): number {
    return wrapNumber(this.horDir, 0, 2 * Math.PI, false);
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    // Enable pointer lock for user input
    this.entity.area.game.input.pointerLockEnabled = true;

    // Build the camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      entity.area.game.canvasWidth / entity.area.game.canvasHeight,
      0.001,
      1000,
    );
    this.entity.area.camera = this.camera;
    this.entity.object = this.camera;

    // Add a gun to the camera
    const gun = entity.area.game.assets.getObject('Gun').clone();
    gun.scale.set(0.1, 0.1, 0.1);
    gun.position.set(0.15, -0.04, 0.05);
    gun.rotation.y = Math.atan2(Infinity, 1.8);
    this.camera.add(gun);
    this.gun = gun;

    // Set the start position in the maze
    const position = (this.entity.area.state as MainArea).tileLocationToPosition(this.startRow, this.startCol);
    this.camera.position.copy(position);
    this.camera.position.y = 2;

    // Box mask to detect collisions
    this.mask = new BoxCollisionMask(PLAYER_BOX3_MASK);
    this.entity.mask = this.mask;
    this.mask.box.translate(position);
  }

  onDestroy(): void {
    // Destroy the HUD
    for (const hud of this.entity.area.findEntities('hud')) {
      hud.destroy();
    }

    // Prepare the death animation
    this.entity.area.createEntity(new DeathAnimation());
  }

  onStep(): void {
    // Make sure the camera is scaled properly
    this.camera.aspect = this.entity.area.game.canvasWidth / this.entity.area.game.canvasHeight;
    this.camera.updateProjectionMatrix();

    // Move the player
    this.handleInput();

    // Test for death
    this.testForDeath();
  }

  /**
   * Handle all input to move the player
   */
  private handleInput(): void {
    const input = this.entity.area.game.input;

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

    if (input.isMouseButtonStarted(MouseButton.Left)) {
      const rotation = new THREE.Euler(0, this.horDir + Math.PI / 2, this.vertDir, 'YXZ');
      this.entity.area.createEntity(new PlayerBullet(this.gun, rotation.toVector3()));
    }
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
    return (
      this.entity.area.findEntities('wall').some((wall) => this.entity.isCollidingWith(wall)) ||
      this.entity.area.findEntities('rock').some((rock) => this.entity.isCollidingWith(rock))
    );
  }

  /**
   * Test if the player has died and handle it!
   */
  private testForDeath(): void {
    const health = this.entity.area.game.resources.getResource<Health>('health');
    if (!health.hasHealthLeft()) {
      this.entity.destroy();
    }
  }

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
