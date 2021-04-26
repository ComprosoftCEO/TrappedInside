import { MainArea } from 'areas/MainArea';
import { SCALE_BASE } from 'areas/AbstractMazeArea';
import { BoxCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';
import { isAngleBetween, isBasicallyInteger, pickRandomArray } from 'engine/helpers';
import { MazeObject } from 'areas/MazeObject';
import { DroneBullet } from './DroneBullet';
import { Explosion } from 'entities/effects/Explosion';
import * as THREE from 'three';

const HEALTH = 30;
const MAX_RANGE = 40;
const MOVEMENT_SPEED = 0.1;
const ROTATION_SPEED = Math.PI / 64;

const CLAMP_THRESHHOLD = 0.0001;
const ROTATION_THRESHHOLD = 0.0001;

// Set of object that block the drone
const CANNOT_MOVE_THROUGH = new Set([MazeObject.Wall, MazeObject.BigDoor]);

// Drone State:
//
// [Moving] -> [Turning]
//    \------<-----/
enum MovementState {
  Moving,
  Turning,
}

// Direction currently moving
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

// Data to make some of the rotation algorithms easier
interface DirectionData {
  opposite: Direction; // Opposite angle to this direction
  angle: number; // Angle for this direction
  reverse: Direction; // Which new direction should spin clockwise?
}

const DIRECTION_DATA: Record<Direction, DirectionData> = {
  [Direction.Up]: { opposite: Direction.Down, angle: Math.PI, reverse: Direction.Right },
  [Direction.Down]: { opposite: Direction.Up, angle: 0, reverse: Direction.Left },
  [Direction.Left]: { opposite: Direction.Right, angle: (3 * Math.PI) / 2, reverse: Direction.Up },
  [Direction.Right]: { opposite: Direction.Left, angle: Math.PI / 2, reverse: Direction.Down },
};

/**
 * Drone enemy that flies around the maze
 */
export class Drone implements EntityState {
  public readonly tags: string[] = ['drone'];

  private entity: Entity<this>;

  // Position in the maze
  private row: number;
  private column: number;

  // Handle the movement logic
  private state: MovementState = MovementState.Turning;
  private dir: Direction = Direction.Down;
  private rotDir = ROTATION_SPEED; // Direction of rotation
  private angle = 0;

  private health = HEALTH;

  /**
   * Create a drone at a given position inside the maze
   */
  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    // Drone object
    const object = entity.area.game.assets.getObject('Drone').clone();
    object.position.copy((entity.area.state as MainArea).tileLocationToPosition(this.row, this.column));
    object.position.y = 10;
    object.children[0].castShadow = true;
    this.entity.object = object;

    // Collision Mask
    this.entity.mask = new BoxCollisionMask(object.children[4]);

    // Timer to shoot mask
    this.entity.setTimer(0, 10, true);

    // Start the maze movement
    this.pickNewDirection();
  }

  onDestroy(): void {}

  onStep(): void {
    this.entity.mask.update(this.entity.object.children[4]);
    this.updateMazePosition();

    if (this.canSeePlayer() && this.inCenterOfTile()) {
      this.pointTowardsPlayer();
    } else {
      this.moveDrone();
    }

    this.checkForBulletCollision();
    this.checkHealth();
  }

  /**
   * Compute the tile position of the entity in the maze
   */
  private updateMazePosition(): void {
    const mainArea = this.entity.area.state as MainArea;
    [this.row, this.column] = mainArea.positionToTileLocation(this.entity.object.position);
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

    // Make sure the ray doesn't collide with any walls before the player
    const raycaster = new THREE.Raycaster(this.entity.object.position, vector.normalize(), 0, distance);
    return this.entity.area.findEntities('wall').every((wall) => {
      const intersection = wall.mask.intersectRay(raycaster.ray);
      if (intersection === null) {
        return true;
      }

      const rayDistance = intersection.distanceTo(this.entity.object.position);
      return rayDistance >= distance;
    });
  }

  /**
   * Test if the drone is in the center of a tile
   */
  private inCenterOfTile(): boolean {
    return (
      isBasicallyInteger(this.entity.object.position.x / SCALE_BASE, CLAMP_THRESHHOLD) &&
      isBasicallyInteger(this.entity.object.position.z / SCALE_BASE, CLAMP_THRESHHOLD)
    );
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

  /**
   * Handle drone movement
   */
  private moveDrone() {
    // Go back to the default rotation
    this.entity.object.rotation.set(0, this.angle, 0);

    switch (this.state) {
      // Move the entity forward
      case MovementState.Moving: {
        this.entity.object.translateX(MOVEMENT_SPEED);

        // Pick a new direction at every tile
        if (this.inCenterOfTile()) {
          const mainArea = this.entity.area.state as MainArea;
          const position = mainArea.tileLocationToPosition(this.row, this.column);
          this.entity.object.position.x = position.x;
          this.entity.object.position.z = position.z;

          this.pickNewDirection();
          this.state = MovementState.Turning;
        }
        break;
      }

      // Turn the entity
      case MovementState.Turning: {
        const dirAngle = DIRECTION_DATA[this.dir].angle;
        if (isAngleBetween(this.angle, dirAngle - ROTATION_THRESHHOLD, dirAngle + ROTATION_THRESHHOLD)) {
          // Clamp to the correct angle
          this.angle = dirAngle;

          // Now move in that direction
          this.state = MovementState.Moving;
        } else {
          // Keep spinning
          this.angle += this.rotDir;
        }
        break;
      }
    }
  }

  /**
   * Pick a new random direction for the entity
   */
  private pickNewDirection() {
    // Figure out directions available
    const mainArea = this.entity.area.state as MainArea;
    const available = [];
    if (!CANNOT_MOVE_THROUGH.has(mainArea.maze[this.row - 1][this.column])) {
      available.push(Direction.Up);
    }
    if (!CANNOT_MOVE_THROUGH.has(mainArea.maze[this.row + 1][this.column])) {
      available.push(Direction.Down);
    }
    if (!CANNOT_MOVE_THROUGH.has(mainArea.maze[this.row][this.column - 1])) {
      available.push(Direction.Left);
    }
    if (!CANNOT_MOVE_THROUGH.has(mainArea.maze[this.row][this.column + 1])) {
      available.push(Direction.Right);
    }

    // Only option available, so pick it
    //  Special case if there are NO directions, rotate forever
    if (available.length <= 1) {
      this.dir = available[0] || DIRECTION_DATA[this.dir].opposite;
      return;
    }

    // Pick a random new direction
    // Not allowed to make 180 degree turn in a hallway
    const currentDir = this.dir;
    const oppositeDir = DIRECTION_DATA[this.dir].opposite;
    const newDir = pickRandomArray(available.filter((dir) => dir !== oppositeDir));

    // When to rotate clockwise versus counter-clockwise
    this.rotDir = DIRECTION_DATA[currentDir].reverse === newDir ? -ROTATION_SPEED : ROTATION_SPEED;
    this.dir = newDir;
  }

  /**
   * Check for collisions with any of the player bullets
   */
  private checkForBulletCollision(): void {
    for (const bullet of this.entity.area.findEntities('player-bullet')) {
      if (this.entity.isCollidingWith(bullet)) {
        bullet.destroy();
        this.health -= 1;

        // Play the sound
        const mainArea = this.entity.area.state as MainArea;
        mainArea.hitObject.volume = 0.125;
        mainArea.hitObject.play();
      }
    }
  }

  /**
   * Check if the health has destroyed the rock
   */
  private checkHealth(): void {
    if (this.health <= 0) {
      this.entity.destroy();

      // Spawn the explosion
      this.entity.area.createEntity(new Explosion(this.entity.object.position, 2));
    }
  }

  onTimer(timerIndex: number): void {
    if (timerIndex === 0 && this.canSeePlayer() && this.inCenterOfTile()) {
      // Shoot at the player
      this.entity.area.createEntity(new DroneBullet(this.entity));

      // Play the sound
      const mainArea = this.entity.area.state as MainArea;
      mainArea.droneShoot.volume = 0.125;
      mainArea.droneShoot.play();
    }
  }

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
