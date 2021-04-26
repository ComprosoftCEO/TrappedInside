import { Entity, EntityState } from 'engine/entity';
import { clamp } from 'engine/helpers';

/**
 * Fade the screen to black
 */
export class FadeOutEffect implements EntityState {
  public readonly tags: string[] = [];

  protected entity: Entity<this>;

  private ticks: number;
  private fade: number;
  private alpha = 0;

  /**
   * Construct a new fade effect
   *
   * @param ticks Number of ticks between each fade
   * @param fade Amount to fade on each tick
   */
  constructor(ticks = 10, fade = 0.1) {
    this.ticks = Math.abs(ticks);
    this.fade = Math.abs(fade);
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;
    this.entity.setTimer(1, this.ticks, true);
  }

  onDestroy(): void {}

  onStep(): void {}

  onTimer(timerIndex: number): void {
    if (timerIndex === 1) {
      this.onTick(this.alpha);
      this.fadeOut();
    }
  }

  /// Can be overridden
  protected onTick(_alpha: number): void {}

  /**
   * Slowly fade out to black
   */
  private fadeOut(): void {
    this.alpha = clamp(this.alpha + this.fade, 0, 1);
    if (this.alpha >= 1) {
      this.entity.clearTimer(1);
      this.onFinish();
    }
  }

  /// Can be overridden
  protected onFinish(): void {}

  onDraw(g2d: CanvasRenderingContext2D): void {
    g2d.globalAlpha = this.alpha;
    g2d.fillStyle = 'black';
    g2d.fillRect(0, 0, this.entity.area.overlayWidth, this.entity.area.overlayHeight);
    g2d.globalAlpha = 1;
  }
}
