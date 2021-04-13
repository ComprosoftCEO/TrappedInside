import { MainArea } from 'areas/MainArea';
import { BoxCollisionMask, GroupCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';
import { Key } from 'engine/input';
import * as THREE from 'three';

export enum DoorColor {
  Red,
  Yellow,
  Green,
  Blue,
}

const MATERIALS: Record<DoorColor, THREE.Material> = {
  [DoorColor.Red]: new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1 }),
  [DoorColor.Yellow]: new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 1 }),
  [DoorColor.Green]: new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 1 }),
  [DoorColor.Blue]: new THREE.MeshStandardMaterial({ color: 0x0000ff, emissive: 0x0000ff, emissiveIntensity: 1 }),
};

/**
 * Door object in the maze
 */
export class Door implements EntityState {
  public readonly tags: string[] = ['wall'];

  private entity: Entity<this>;

  private row: number;
  private column: number;
  private absPosition: THREE.Vector3;
  private doorColor: DoorColor;

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
  constructor(row: number, column: number, color: DoorColor, area: MainArea) {
    this.row = row;
    this.column = column;
    this.absPosition = area.tileLocationToPosition(row, column);
    this.doorColor = color;
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    // Put object in the correct location
    const object = entity.area.game.assets.getObject('Door').clone();
    object.scale.y = 2.5;
    object.scale.z = 2.5;
    object.position.copy(this.absPosition);

    // Doors in even-numbered rows are horizontal (default)
    // Doors in odd-numbered rows are vertical
    const isVertical = this.row % 2 !== 0;
    if (isVertical) {
      object.rotation.y = Math.PI / 2;
    }

    // Doors should cast and receive shadows
    for (const child of object.children) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
    for (const keyChild of object.children[0].children) {
      keyChild.castShadow = true;
      keyChild.receiveShadow = true;
    }

    // Update the material
    this.configureMaterialColor(object.children[0].children[1] as THREE.Mesh);

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

    Door.configureAnimation(this.leftDoorAction);
    Door.configureAnimation(this.rightDoorAction);
    Door.configureAnimation(this.keyHoleAction);
  }

  private configureMaterialColor(key: THREE.Mesh): void {
    const material = MATERIALS[this.doorColor];
    if (typeof material !== 'undefined') {
      key.material = material;
    }
  }

  private static configureAnimation(action: THREE.AnimationAction): void {
    action.loop = THREE.LoopOnce;
    action.clampWhenFinished = true;
  }

  onDestroy(): void {}

  onStep(): void {
    this.mixer.update(0.01);
    this.leftDoorMask.update(this.leftDoor);
    this.rightDoorMask.update(this.rightDoor);

    if (this.entity.area.game.input.isKeyStarted(Key.O)) {
      this.leftDoorAction.play();
      this.rightDoorAction.play();
      this.keyHoleAction.play();
    }
  }

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
