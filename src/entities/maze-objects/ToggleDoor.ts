import { SphereCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';
import { HUD } from 'entities/HUD';
import { DoorState } from 'resources/DoorState';
import { AbstractDoor } from './AbstractDoor';

/**
 * Door object in the maze
 */
export class ToggleDoor extends AbstractDoor implements EntityState {
  public readonly tags: string[] = ['wall'];

  private readonly reverse: boolean;
  private interactMask: SphereCollisionMask;

  /**
   * Spawn a wall in a tile inside the maze
   */
  constructor(row: number, column: number, reverse = false) {
    super(row, column, 'ToggleDoor');
    this.reverse = reverse;
  }

  onCreateDoor(): void {
    this.interactMask = new SphereCollisionMask(this.entity.object);
  }

  onDestroy(): void {}

  onStepDoor(): void {
    this.syncWithState();
    this.testForPlayerInteraction();
  }

  /**
   * Make sure the door matches the global state
   */
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

  /**
   * See if the player is colliding so it can handle user interaction
   */
  private testForPlayerInteraction(): void {
    if (this.open) {
      return; // Don't show message for open door
    }

    const player = this.entity.area.findFirstEntity('player');
    if (player === null || !this.interactMask.isCollidingWith(player.mask)) {
      return;
    }

    // Show HUD message
    const hud = this.entity.area.findFirstEntity('hud') as Entity<HUD>;
    if (hud !== null && hud.state.message.length === 0) {
      hud.state.message = 'Flip lever to toggle door';
    }
  }

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
