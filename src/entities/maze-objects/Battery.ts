import { MainArea } from 'areas/MainArea';
import { MazeObject } from 'areas/MazeObject';
import { BoxCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';
import { Inventory } from 'resources/Inventory';

/**
 * Collectable battery in the maze
 */
export class Battery implements EntityState {
  public readonly tags: string[] = ['battery'];

  private entity: Entity<this>;
  private row: number;
  private column: number;

  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    const object = this.entity.area.game.assets.getObject('Battery').clone();
    object.position.copy((entity.area.state as MainArea).tileLocationToPosition(this.row, this.column));
    object.position.y = 2;
    object.scale.set(2, 2, 2);
    object.children[2].castShadow = true;
    this.entity.object = object;

    this.entity.mask = new BoxCollisionMask(object);
  }

  onDestroy(): void {
    // Remove the battery from the maze
    const mainArea = this.entity.area.state as MainArea;
    mainArea.maze[this.row][this.column] = MazeObject.Empty;

    // Update the inventory
    const inventory = this.entity.area.game.resources.getResource<Inventory>('inventory');
    inventory.collectBattery();

    // Play the sound
    mainArea.collectItem.play();
  }

  onStep(): void {
    // Test for player collision to collect the battery
    const player = this.entity.area.findFirstEntity('player');
    if (player !== null && this.entity.isCollidingWith(player)) {
      this.entity.destroy();
    }
  }

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
