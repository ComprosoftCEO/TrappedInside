import { MainArea } from 'areas/MainArea';
import { Entity, EntityState } from 'engine/entity';
import { clamp } from 'engine/helpers';

/**
 * Fade the screen to black if the player dies
 */
export class DeathAnimation implements EntityState {
  public readonly tags: string[] = ['death-animation'];

  private entity: Entity<this>;
  private alpha = 0;

  onCreate(entity: Entity<this>): void {
    this.entity = entity;
    this.entity.setTimer(1, 10, true);
  }

  onDestroy(): void {}

  onStep(): void {}

  onTimer(timerIndex: number): void {
    if (timerIndex === 1) {
      this.fadeOut();
    }
    if (timerIndex === 2) {
      this.restartScene();
    }
  }

  /**
   * Slowly fade out to black
   */
  private fadeOut(): void {
    this.alpha = clamp(this.alpha + 0.1, 0, 1);
    if (this.alpha >= 1) {
      this.entity.clearTimer(1);
      this.entity.setTimer(2, 30, false);
    }
  }

  /**
   * Restart the scene
   */
  private restartScene(): void {
    this.entity.area.game.setArea(new MainArea());
    console.log('Reset!');
  }

  onDraw(g2d: CanvasRenderingContext2D): void {
    g2d.globalAlpha = this.alpha;
    g2d.fillStyle = 'black';
    g2d.fillRect(0, 0, this.entity.area.overlayWidth, this.entity.area.overlayHeight);
    g2d.globalAlpha = 1;
  }
}
