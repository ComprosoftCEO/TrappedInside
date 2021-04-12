import { MainArea, MAX_PLAYER, MIN_PLAYER } from 'areas/MainArea';
import { SphereCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';
import { randomFloat, randomInt, wrapNumber } from 'engine/helpers';
import * as THREE from 'three';
import { SpaceObject } from './SpaceObject';

const MIN_ASTEROID = -100;
const MAX_ASTEROID = 100;

const MIN_SCALE = 0.25;
const MAX_SCALE = 3;
const HEALTH_SCALAR = 50; // Health is based on scale

/**
 * Represents an asteroid in the scene
 */
export class Asteroid implements EntityState, SpaceObject {
  public readonly tags: string[] = ['asteroid', 'space-object'];

  private entity: Entity<this>;
  private rotation: THREE.Vector3;
  private health: number;

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    this.entity.object = this.entity.area.game.assets.getObject('Asteroid').clone();
    this.entity.mask = new SphereCollisionMask(this.entity.object);

    this.randomize();
  }

  /**
   * Randomize all of the asteroid parameters
   */
  private randomize(): void {
    // Pick random location
    this.pickRandomSafeLocation();

    // Pick random scale, and base the health on the scale
    const scale = randomFloat(MIN_SCALE, MAX_SCALE);
    this.entity.object.scale.set(scale, scale, scale);
    this.health = Math.floor(HEALTH_SCALAR * scale);

    // Pick random rotation
    this.rotation = new THREE.Vector3(randomFloat(-1, 1), randomFloat(-1, 1), randomFloat(-1, 1)).normalize();

    // Update the collision mask
    this.entity.mask.update(this.entity.object);
  }

  /**
   * Move the asteroid to a random safe location in the world
   */
  private pickRandomSafeLocation(): void {
    let x = 0;
    let z = 0;

    while (x >= MIN_PLAYER && x <= MAX_PLAYER && z >= MIN_PLAYER && z <= MAX_PLAYER) {
      x = randomInt(MIN_ASTEROID, MAX_ASTEROID);
      z = randomInt(MIN_ASTEROID, MAX_ASTEROID);
    }

    this.entity.object.position.x = x;
    this.entity.object.position.z = z;
  }

  onDestroy(): void {}

  onStep(): void {
    this.entity.object.rotateOnAxis(this.rotation, Math.PI / 32);

    this.testBulletCollision();
  }

  private testBulletCollision(): void {
    for (const bullet of this.entity.area.findEntities('bullet')) {
      if (this.entity.isCollidingWith(bullet)) {
        (this.entity.area.state as MainArea).hit.play();
        bullet.destroy();

        this.health -= randomFloat(25, 35);
        this.testAsteroidDestroyed();
        break;
      }
    }
  }

  private testAsteroidDestroyed(): void {
    if (this.health <= 0) {
      (this.entity.area.state as MainArea).explosion.play();
      this.randomize();
    }
  }

  moveForward(angle: number, velocity: number): void {
    this.entity.object.position.x += Math.cos(angle) * velocity;
    this.entity.object.position.z += -Math.sin(angle) * velocity;

    // Wrap object
    this.entity.object.position.x = wrapNumber(this.entity.object.position.x, MIN_ASTEROID, MAX_ASTEROID);
    this.entity.object.position.z = wrapNumber(this.entity.object.position.z, MIN_ASTEROID, MAX_ASTEROID);
    this.entity.mask.update(this.entity.object);
  }

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
