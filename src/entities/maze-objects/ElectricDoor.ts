import { Entity, EntityState } from 'engine/entity';
import { DoorState } from 'resources/DoorState';
import { AbstractDoor } from 'entities/maze-objects/AbstractDoor';
import { ElectricBoxType } from 'entities/ElectricBoxType';
import { SphereCollisionMask } from 'engine/collision';
import { HUD } from 'entities/HUD';

/**
 * Door object in the maze
 */
export class ElectricDoor extends AbstractDoor implements EntityState {
  public readonly tags: string[] = ['wall'];

  private readonly type: ElectricBoxType;
  private interactMask: SphereCollisionMask;

  constructor(row: number, column: number, type: ElectricBoxType) {
    super(row, column, 'ElectricDoor');
    this.type = type;
  }

  onCreateDoor(): void {
    // Configure interaction masks
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
    if (this.open !== state.isDoorPowered(this.type)) {
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
      hud.state.message = 'Door needs to be powered';
    }
  }

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
