import { MainArea } from 'areas/MainArea';
import { SCALE_BASE } from 'areas/AbstractMazeArea';
import { BoxCollisionMask, GroupCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';
import * as THREE from 'three';

/**
 * Handles any generic type of door in the maze.
 * This is helpful because all doors use the same opening, closing, and collision mask behavior.
 */
export abstract class AbstractDoor {
  protected entity: Entity<EntityState>;

  protected row: number;
  protected column: number;
  private _open = false;

  // Store references to the mesh objects and collision mask components
  private doorObject: string;
  private leftDoor: THREE.Mesh;
  private leftDoorMask: BoxCollisionMask;
  private rightDoor: THREE.Mesh;
  private rightDoorMask: BoxCollisionMask;

  // Animations
  private mixer: THREE.AnimationMixer;
  private leftDoorAction: THREE.AnimationAction;
  private rightDoorAction: THREE.AnimationAction;
  private keyHoleAction: THREE.AnimationAction;

  constructor(row: number, column: number, doorObject: string) {
    this.row = row;
    this.column = column;
    this.doorObject = doorObject;
  }

  /// Test if the door is opened or not
  protected get open(): boolean {
    return this._open;
  }

  /// Handles on create method for specific doors
  protected abstract onCreateDoor(): void;

  /// Handles on step method for specific doors
  protected abstract onStepDoor(): void;

  onCreate(entity: Entity<EntityState>): void {
    this.entity = entity;

    // Put object in the correct location
    const object = entity.area.game.assets.getObject(this.doorObject).clone();
    object.scale.y = SCALE_BASE / 2;
    object.scale.z = SCALE_BASE / 2;
    object.position.copy((entity.area.state as MainArea).tileLocationToPosition(this.row, this.column));

    // Doors in even-numbered rows are horizontal (default)
    // Doors in odd-numbered rows are vertical
    const isVertical = this.row % 2 !== 0;
    if (isVertical) {
      object.rotation.y = Math.PI / 2;
    }

    // Doors should cast shadows
    for (const child of object.children) {
      child.castShadow = true;
    }
    for (const keyChild of object.children[0].children) {
      keyChild.castShadow = true;
    }

    this.entity.object = object;

    // Configure collision masks
    this.leftDoor = this.entity.object.children[2] as THREE.Mesh;
    this.leftDoorMask = new BoxCollisionMask(this.leftDoor);
    this.rightDoor = this.entity.object.children[1] as THREE.Mesh;
    this.rightDoorMask = new BoxCollisionMask(this.rightDoor);

    this.entity.mask = new GroupCollisionMask(this.leftDoorMask, this.rightDoorMask);

    // Load animations
    this.mixer = new THREE.AnimationMixer(object);
    this.leftDoorAction = this.mixer.clipAction(entity.area.game.assets.getAnimation('LeftDoorAction'));
    this.rightDoorAction = this.mixer.clipAction(entity.area.game.assets.getAnimation('RightDoorAction'));
    this.keyHoleAction = this.mixer.clipAction(entity.area.game.assets.getAnimation('KeyHoleAction'));

    AbstractDoor.configureAnimation(this.leftDoorAction);
    AbstractDoor.configureAnimation(this.rightDoorAction);
    AbstractDoor.configureAnimation(this.keyHoleAction);

    // Call the subclass "onCreate" method
    this.onCreateDoor();
  }

  private static configureAnimation(action: THREE.AnimationAction): void {
    action.loop = THREE.LoopOnce;
    action.clampWhenFinished = true;
  }

  onStep(): void {
    this.mixer.update(0.01);

    // Special case: mask entire door when closing so player does not get stuck in door
    if (!this._open && this.isAnimationPlaying()) {
      this.leftDoorMask.update(this.entity.object);
      this.rightDoorMask.update(this.entity.object);
    } else {
      this.leftDoorMask.update(this.leftDoor);
      this.rightDoorMask.update(this.rightDoor);
    }

    // Call the subclass "onStep" method
    this.onStepDoor();
  }

  /**
   * Play the open door animation and closes the door.
   * Optionally specify a custom time scale (relative speed) for the door (Should be > 0).
   */
  protected openDoor(timeScale = 1): void {
    this._open = true;

    AbstractDoor.playAction(this.leftDoorAction, timeScale);
    AbstractDoor.playAction(this.rightDoorAction, timeScale);
    AbstractDoor.playAction(this.keyHoleAction, timeScale);
  }

  /**
   * Play the close door animation and closes the door.
   * Optionally specify a custom time scale (relative speed) for the door (Should be > 0).
   */
  protected closeDoor(timeScale = 1): void {
    this._open = false;

    AbstractDoor.playActionInverse(this.leftDoorAction, timeScale);
    AbstractDoor.playActionInverse(this.rightDoorAction, timeScale);
    AbstractDoor.playActionInverse(this.keyHoleAction, timeScale);
  }

  /**
   * Test if the animation is currently open
   */
  private isAnimationPlaying(): boolean {
    return this.leftDoorAction.isRunning() || this.rightDoorAction.isRunning() || this.keyHoleAction.isRunning();
  }

  /**
   * Play an action in the forward direction
   */
  private static playAction(action: THREE.AnimationAction, timeScale: number) {
    action.timeScale = Math.abs(timeScale);
    action.paused = false;
    action.play();
  }

  /**
   * Play an action in the inverse direction
   */
  private static playActionInverse(action: THREE.AnimationAction, timeScale: number) {
    action.timeScale = -Math.abs(timeScale);
    action.paused = false;
    action.play();
  }
}
