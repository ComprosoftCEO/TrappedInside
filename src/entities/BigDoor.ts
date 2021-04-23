import { SCALE_HEIGHT } from 'areas/MainArea';
import { EntityState } from 'engine/entity';
import { Key } from 'engine/input';
import { DoorState } from 'resources/DoorState';
import { AbstractDoor } from './AbstractDoor';

/**
 * Door object in the maze
 */
export class BigDoor extends AbstractDoor implements EntityState {
  public readonly tags: string[] = ['wall'];

  constructor(row: number, column: number) {
    super(row, column, 'Door');
  }

  onCreateDoor(): void {
    // Make the door REALLY TALL, REALLY THICK, and hide the key hole color
    this.entity.object.scale.y = SCALE_HEIGHT / 3;
    this.entity.object.scale.x = 10;
    this.entity.object.children[0].visible = false;
  }

  onDestroy(): void {}

  onStepDoor(): void {
    /// TODO: Implement this action
    if (this.entity.area.game.input.isKeyStarted(Key.O) && !this.open) {
      this.openBigDoor();
    }
  }

  /**
   * Open the door, really slowly
   */
  private openBigDoor(): void {
    const state = this.entity.area.game.resources.getResource<DoorState>('door-state');
    state.openBigDoor();
    this.openDoor(1 / 6);
  }

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
