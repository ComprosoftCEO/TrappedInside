import { MainArea } from 'areas/MainArea';
import { Entity, EntityState } from 'engine/entity';
import { DoorColor } from 'entities/DoorColor';
import { SphereCollisionMask } from 'engine/collision';
import { randomFloat } from 'engine/helpers';
import { Inventory } from 'resources/Inventory';
import { MazeObject } from 'areas/MazeObject';
import * as THREE from 'three';

const KEY_COLOR_MATERIALS: Record<DoorColor, THREE.Material> = {
  [DoorColor.Red]: new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.25 }),
  [DoorColor.Yellow]: new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.25 }),
  [DoorColor.Green]: new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.25 }),
  [DoorColor.Blue]: new THREE.MeshStandardMaterial({ color: 0x0000ff, emissive: 0x0000ff, emissiveIntensity: 0.25 }),
};

/**
 * Key that can open doors
 */
export class Key implements EntityState {
  public readonly tags: string[] = ['key'];

  public readonly color: DoorColor;

  private entity: Entity<this>;
  private row: number;
  private column: number;

  constructor(row: number, column: number, color: DoorColor) {
    this.row = row;
    this.column = column;
    this.color = color;
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    // Configure the object
    const object = entity.area.game.assets.getObject('Key').clone() as THREE.Mesh;
    object.position.copy((entity.area.state as MainArea).tileLocationToPosition(this.row, this.column));
    object.position.y = 2;
    object.rotation.y = randomFloat(0, 2 * Math.PI);
    object.scale.set(0.5, 0.25, 0.25);
    object.castShadow = true;
    this.entity.object = object;

    // Configure object material
    const material = KEY_COLOR_MATERIALS[this.color];
    if (typeof material !== 'undefined') {
      object.material = material;
    }

    // Configure object mask
    this.entity.mask = new SphereCollisionMask(this.entity.object);
  }

  onDestroy(): void {
    // Remove the key from the maze
    const mainArea = this.entity.area.state as MainArea;
    mainArea.maze[this.row][this.column] = MazeObject.Empty;

    // Update the inventory
    const inventory = this.entity.area.game.resources.getResource<Inventory>('inventory');
    inventory.collectKey(this.color);

    // Play the sound
    mainArea.collectItem.play();
  }

  onStep(): void {
    // Spin to make the key more noticable
    this.entity.object.rotateY(Math.PI / 256);

    // Test for player collision to collect the key
    const player = this.entity.area.findFirstEntity('player');
    if (player !== null && this.entity.isCollidingWith(player)) {
      this.entity.destroy();
    }
  }

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
