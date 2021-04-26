import { SCALE_HEIGHT } from 'areas/AbstractMazeArea';
import { EntityState } from 'engine/entity';
import { AbstractDoor } from './AbstractDoor';

/**
 * Door object in the maze
 */
export class DummyBigDoor extends AbstractDoor implements EntityState {
  public readonly tags: string[] = ['wall'];

  private showMessage = false;

  constructor(row: number, column: number) {
    super(row, column, 'Door');
  }

  onCreateDoor(): void {
    // Make the door REALLY TALL, REALLY THICK, and hide the key hole color
    this.entity.object.scale.y = SCALE_HEIGHT / 3;
    this.entity.object.scale.x = 10;
    this.entity.object.children[0].visible = false;

    // Force the door to be opened
    this.openDoor(1 / 6);
  }

  onDestroy(): void {}

  onStepDoor(): void {}

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
