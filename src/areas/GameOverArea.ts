import { Area, AreaState } from 'engine/area';
import { RestartButton } from 'entities/ui/RestartButton';

/**
 * Game over screen in the game
 */
export class GameOverArea implements AreaState {
  private area: Area<this>;

  onCreate(area: Area<this>): void {
    this.area = area;
    this.area.createEntity(new RestartButton());

    this.area.game.input.pointerLockEnabled = false;
  }

  onTimer(_timerIndex: number): void {}

  onStep(): void {}

  onDraw(g2d: CanvasRenderingContext2D): void {
    g2d.font = '48pt sans-serif';
    g2d.textAlign = 'center';
    g2d.textBaseline = 'top';
    g2d.fillStyle = 'red';

    g2d.fillText('Game Over', this.area.overlayWidth / 2, 40);
  }
}
