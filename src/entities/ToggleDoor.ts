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
export class ToggleDoor implements EntityState {
  public readonly tags: string[] = ['wall'];

  private readonly reverse: boolean;

  private entity: Entity<this>;

  private row: number;
  private column: number;
  private open = false;

  // Store references to the mesh objects and collision mask components
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
  constructor(row: number, column: number, reverse = false) {
    this.row = row;
    this.column = column;
    this.reverse = reverse;
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    // Put object in the correct location
    const object = entity.area.game.assets.getObject('ToggleDoor').clone();
    object.scale.y = SCALE_BASE / 2;
    object.scale.z = SCALE_BASE / 2;
    object.position.copy((entity.area.state as MainArea).tileLocationToPosition(this.row, this.column));

    // Doors in even-numbered rows are horizontal (default)
    // Doors in odd-numbered rows are vertical
    const isVertical = this.row % 2 !== 0;
    if (isVertical) {
      object.rotation.y = Math.PI / 2;
    }

    // Doors should cast and receive shadows
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

    ToggleDoor.configureAnimation(this.leftDoorAction);
    ToggleDoor.configureAnimation(this.rightDoorAction);
    ToggleDoor.configureAnimation(this.keyHoleAction);
  }

  private static configureAnimation(action: THREE.AnimationAction): void {
    action.loop = THREE.LoopOnce;
    action.clampWhenFinished = true;
  }

  onDestroy(): void {}

  onStep(): void {
    this.mixer.update(0.01);

    if (!this.open && this.isAnimationPlaying()) {
      this.leftDoorMask.update(this.entity.object);
      this.rightDoorMask.update(this.entity.object);
    } else {
      this.leftDoorMask.update(this.leftDoor);
      this.rightDoorMask.update(this.rightDoor);
    }

    this.syncWithState();
  }

  private syncWithState(): void {
    const state = this.entity.area.game.resources.getResource<DoorState>('door-state');
    const expectedState = this.reverse ? !state.getToggleState() : state.getToggleState();
    if (this.open !== expectedState) {
      if (this.open) {
        this.closeDoor();
      } else {
        this.openDoor();
      }
    }
  }

  private closeDoor(): void {
    this.open = false;

    ToggleDoor.playActionInverse(this.leftDoorAction);
    ToggleDoor.playActionInverse(this.rightDoorAction);
    ToggleDoor.playActionInverse(this.keyHoleAction);
  }

  private openDoor(): void {
    this.open = true;

    ToggleDoor.playAction(this.leftDoorAction);
    ToggleDoor.playAction(this.rightDoorAction);
    ToggleDoor.playAction(this.keyHoleAction);
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

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
