import { SCALE_HEIGHT } from 'areas/AbstractMazeArea';
import { EntityState } from 'engine/entity';
import { DoorState } from 'resources/DoorState';
import { Inventory } from 'resources/Inventory';
import { AbstractDoor } from './AbstractDoor';
import { HUD } from 'entities/HUD';

/**
 * Door object in the maze
 */
export class BigDoor extends AbstractDoor implements EntityState {
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
  }

  onDestroy(): void {}

  onStepDoor(): void {
    this.testIfAllItemsCollected();

    // Draw the message when the game first starts
    if (this.showMessage) {
      const hud = this.entity.area.findFirstEntity('hud');
      if (hud !== null) {
        (hud.state as HUD).message = 'Collect all energy to activate the portal!';
      }
    }
  }

  /**
   * Open the big door once all of the items have been collected
   */
  private testIfAllItemsCollected() {
    if (this.open) {
      return;
    }

    const inventory = this.entity.area.game.resources.getResource<Inventory>('inventory');
    if (inventory.hasCollectedGun() && inventory.hasCollectedMap()) {
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

    // Hide the message after a given number of ticks
    this.showMessage = true;
    this.entity.setTimer(0, 400, false);
  }

  onTimer(timerIndex: number): void {
    if (timerIndex === 0) {
      this.showMessage = false;
    }
  }

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
