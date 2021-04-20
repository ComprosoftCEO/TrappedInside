import { EntityState } from 'engine/entity';
import { DoorState } from 'resources/DoorState';
import { AbstractDoor } from './AbstractDoor';
import { ElectricBoxType } from './ElectricBoxType';

/**
 * Door object in the maze
 */
export class ElectricDoor extends AbstractDoor implements EntityState {
  public readonly tags: string[] = ['wall'];

  private readonly type: ElectricBoxType;

  constructor(row: number, column: number, type: ElectricBoxType) {
    super(row, column, 'ElectricDoor');
    this.type = type;
  }

  onCreateDoor(): void {}

  onDestroy(): void {}

  onStepDoor(): void {
    this.syncWithState();
  }

  private syncWithState(): void {
    const state = this.entity.area.game.resources.getResource<DoorState>('door-state');
    if (this.open !== state.isDoorPowered(this.type)) {
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
