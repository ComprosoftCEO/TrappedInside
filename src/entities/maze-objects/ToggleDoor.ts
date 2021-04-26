import { EntityState } from 'engine/entity';
import { DoorState } from 'resources/DoorState';
import { AbstractDoor } from './AbstractDoor';

/**
 * Door object in the maze
 */
export class ToggleDoor extends AbstractDoor implements EntityState {
  public readonly tags: string[] = ['wall'];

  private readonly reverse: boolean;

  /**
   * Spawn a wall in a tile inside the maze
   */
  constructor(row: number, column: number, reverse = false) {
    super(row, column, 'ToggleDoor');
    this.reverse = reverse;
  }

  onCreateDoor(): void {}

  onDestroy(): void {}

  onStepDoor(): void {
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

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
