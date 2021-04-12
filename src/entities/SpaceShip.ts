import { Entity, EntityState } from 'engine/entity';
import { GamepadAxis, GamepadButton, Key } from 'engine/input';
import { Vector3 } from 'three';
import { SpaceObject } from './SpaceObject';
import * as THREE from 'three';
import { Bullet } from './Bullet';
import { SphereCollisionMask } from 'engine/collision';
import { MainArea } from 'areas/MainArea';

const ROT_SPEED = Math.PI / 30;
const MAX_VELOCITY = 1;
const SPEED = 0.08;
const DRAG = 0.02;
const DEAD_ZONE = 0.5;

/**
 * Represents a space ship in the game
 */
export class SpaceShip implements EntityState {
  public readonly tags: string[] = ['spaceship'];

  private entity: Entity<this>;

  // Angle should be 180 degrees opposite to the player
  private rotationAngle = 0;
  private velocity = 0;

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    this.entity.object = entity.area.game.assets.getObject('SpaceShip');
    this.entity.mask = new SphereCollisionMask(this.entity.object);
  }

  onDestroy(): void {}

  onStep(): void {
    const input = this.entity.area.game.input;

    // Handle normal rotation
    if (input.isKeyDown(Key.Left) || input.isGamepadButtonDown(0, GamepadButton.Left)) {
      this.rotateCounterClockwise();
    }
    if (input.isKeyDown(Key.Right) || input.isGamepadButtonDown(0, GamepadButton.Right)) {
      this.rotateClockwise();
    }

    // Test for the angle of the left joystick
    const posX = input.getGamepadAxis(0, GamepadAxis.LeftStickX);
    const posY = -input.getGamepadAxis(0, GamepadAxis.LeftStickY);

    // Make sure left joystick is outside of the "dead" zone
    if (posX < -DEAD_ZONE || posX > DEAD_ZONE || posY < -DEAD_ZONE || posY > DEAD_ZONE) {
      this.rotationAngle = Math.atan2(posY, posX);
      this.entity.object.setRotationFromEuler(new THREE.Euler(0, this.rotationAngle, 0));
    }

    // Accelerate (and show flame)
    if (
      input.isKeyDown(Key.Up) ||
      input.isGamepadButtonDown(0, GamepadButton.Up) ||
      input.getGamepadAxis(0, GamepadAxis.RightTrigger) > 0.5
    ) {
      this.increaseVelocity();
      this.entity.object.children[5].visible = true;
    } else {
      this.entity.object.children[5].visible = false;
    }

    // Decelerate
    if (
      input.isKeyDown(Key.Down) ||
      input.isGamepadButtonDown(0, GamepadButton.Down) ||
      input.getGamepadAxis(0, GamepadAxis.LeftTrigger) > 0.5
    ) {
      this.decreaseVelocity();
    }

    // Shoot
    if (
      input.isKeyStarted(Key.Space) ||
      input.isGamepadButtonStarted(0, GamepadButton.ACross) ||
      input.isGamepadButtonStarted(0, GamepadButton.XSquare)
    ) {
      this.shoot();
    }

    this.testForAsteroidCollision();
    this.updateCollisionMask();
    if (input.isKeyStarted(Key.T)) {
      this.toggleMasks();
    }

    this.moveObjectsForward();
    this.velocity = Math.max(0, this.velocity - DRAG);
  }

  /**
   * Rotate in a clockwise direction
   */
  private rotateClockwise(): void {
    this.entity.object.rotateOnAxis(new Vector3(0, 1, 0), -ROT_SPEED);
    this.rotationAngle -= ROT_SPEED;
  }

  /**
   * Rotate in a counter-clockwise direction
   */
  private rotateCounterClockwise(): void {
    this.entity.object.rotateOnAxis(new Vector3(0, 1, 0), ROT_SPEED);
    this.rotationAngle += ROT_SPEED;
  }

  /**
   * Speed up the player
   */
  private increaseVelocity(): void {
    this.velocity = Math.min(MAX_VELOCITY, this.velocity + SPEED);
  }

  /**
   * Slow down the player
   */
  private decreaseVelocity(): void {
    this.velocity = Math.max(0, this.velocity - SPEED);
  }

  /**
   * Move all of the space objects in the game forward in the opposite direction of the player
   */
  private moveObjectsForward(): void {
    if (this.velocity === 0) {
      return;
    }

    // Rotate opposite to the current Y rotation
    const angle = this.rotationAngle + Math.PI;
    for (const e of this.entity.area.findEntities('space-object')) {
      const spaceObject = e as Entity<SpaceObject>;
      spaceObject.state.moveForward(angle, this.velocity);
    }
  }

  /**
   * Shoot a bullet
   */
  private shoot(): void {
    (this.entity.area.state as MainArea).shoot.play();
    this.entity.area.createEntity(new Bullet(this.rotationAngle));
  }

  /**
   * Update the collision mask
   */
  private updateCollisionMask(): void {
    const mask = this.entity.mask as SphereCollisionMask;
    mask.sphere.center.copy(this.entity.object.position);
    mask.sphere.radius = 2.5;
  }

  /**
   * Test if the player is colliding with any asteroids
   */
  private testForAsteroidCollision(): void {
    for (const asteroid of this.entity.area.findEntities('asteroid')) {
      if (this.entity.isCollidingWith(asteroid)) {
        console.log('Collision');
      }
    }
  }

  /**
   * Toggle the collision masks for all objects
   */
  private toggleMasks(): void {
    for (const entity of this.entity.area.getAllEntities()) {
      entity.mask.showMask = !entity.mask.showMask;
    }
  }

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
