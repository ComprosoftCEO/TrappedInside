import { MainArea, SCALE_BASE } from 'areas/MainArea';
import { BoxCollisionMask, GroupCollisionMask, SphereCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';
import { Key } from 'engine/input';
import { DoorColor } from './DoorColor';
import { HUD } from './HUD';
import { Inventory } from 'resources/Inventory';
import * as THREE from 'three';
import { DoorState } from 'resources/DoorState';

/**
 * Door object in the maze
 */
export abstract class AbstractDoor {
  private entity: Entity<EntityState>;

  protected row: number;
  protected column: number;
  protected open = false;

  // Store references to the mesh objects and collision mask components
  private doorObject: THREE.Object3D;
  private leftDoor: THREE.Mesh;
  private leftDoorMask: BoxCollisionMask;
  private rightDoor: THREE.Mesh;
  private rightDoorMask: BoxCollisionMask;

  // Animations
  private mixer: THREE.AnimationMixer;
  private leftDoorAction: THREE.AnimationAction;
  private rightDoorAction: THREE.AnimationAction;
  private keyHoleAction: THREE.AnimationAction;

  /**
   * Spawn a wall in a tile inside the maze
   */
  constructor(row: number, column: number, doorObject: THREE.Object3D) {
    this.row = row;
    this.column = column;
    this.doorObject = doorObject;
  }

  /// Handles on create method for specific doors
  abstract onCreateDoor(): void;

  /// Handles on step method for specific doors
  abstract onStepDoor(): void;

  onCreate(entity: Entity<EntityState>): void {
    // Put object in the correct location
    const object = this.doorObject;
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
  }

  private static configureAnimation(action: THREE.AnimationAction): void {
    action.loop = THREE.LoopOnce;
    action.clampWhenFinished = true;
  }

  onStep(): void {
    this.mixer.update(0.01);

    // Special case: mask entire door when closing so player does not get stuck in door
    if (!this.open && this.isAnimationPlaying()) {
      this.leftDoorMask.update(this.entity.object);
      this.rightDoorMask.update(this.entity.object);
    } else {
      this.leftDoorMask.update(this.leftDoor);
      this.rightDoorMask.update(this.rightDoor);
    }

    this.onStepDoor();
  }

  /**
   * Play the open door animation and closes the door.
   */
  protected openDoor(): void {
    this.open = true;

    AbstractDoor.playAction(this.leftDoorAction);
    AbstractDoor.playAction(this.rightDoorAction);
    AbstractDoor.playAction(this.keyHoleAction);
  }

  /**
   * Play the close door animation and closes the door.
   */
  protected closeDoor(): void {
    this.open = false;

    AbstractDoor.playActionInverse(this.leftDoorAction);
    AbstractDoor.playActionInverse(this.rightDoorAction);
    AbstractDoor.playActionInverse(this.keyHoleAction);
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
  private static playAction(action: THREE.AnimationAction) {
    action.timeScale = 1;
    action.paused = false;
    action.play();
  }

  /**
   * Play an action in the inverse direction
   */
  private static playActionInverse(action: THREE.AnimationAction) {
    action.timeScale = -1;
    action.paused = false;
    action.play();
  }
}
