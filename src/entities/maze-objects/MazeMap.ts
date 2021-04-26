import { MainArea } from 'areas/MainArea';
import { Entity, EntityState } from 'engine/entity';
import { SphereCollisionMask } from 'engine/collision';
import { randomFloat } from 'engine/helpers';
import { Inventory } from 'resources/Inventory';
import { MazeObject } from 'areas/MazeObject';
import * as THREE from 'three';

/**
 * Map that you collect to show the HUD
 */
export class MazeMap implements EntityState {
  public readonly tags: string[] = ['map'];

  private entity: Entity<this>;
  private row: number;
  private column: number;

  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    // Configure the object
    const object = entity.area.game.assets.getObject('Map').clone() as THREE.Mesh;
    object.position.copy((entity.area.state as MainArea).tileLocationToPosition(this.row, this.column));
    object.position.y = 2;
    object.rotation.y = randomFloat(0, 2 * Math.PI);
    object.scale.set(0.125, 0.125, 0.125);
    object.castShadow = true;
    this.entity.object = object;

    // Configure object mask
    this.entity.mask = new SphereCollisionMask(this.entity.object);
  }

  onDestroy(): void {
    // Remove the map from the maze
    const mainArea = this.entity.area.state as MainArea;
    mainArea.maze[this.row][this.column] = MazeObject.Empty;

    // Update the inventory
    const inventory = this.entity.area.game.resources.getResource<Inventory>('inventory');
    inventory.collectMap();
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
