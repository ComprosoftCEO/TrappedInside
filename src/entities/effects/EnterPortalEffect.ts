import { EndingArea } from 'areas/EndingArea';
import { MainArea } from 'areas/MainArea';
import { Entity, EntityState } from 'engine/entity';
import { clamp } from 'engine/helpers';

/**
 * Fade the screen as you enter the portal
 */
export class EnterPortalEffect implements EntityState {
  public readonly tags: string[] = [];

  protected entity: Entity<this>;

  private fadeAlpha = 0;
  private blackAlpha = 0;

  onCreate(entity: Entity<this>): void {
    this.entity = entity;
    this.entity.setTimer(1, 15, true);

    // Play the sound
    const mainArea = this.entity.area.state as MainArea;
    mainArea.enterPortal.play();
  }

  onDestroy(): void {}

  onStep(): void {}

  onTimer(timerIndex: number): void {
    if (timerIndex === 1) {
      this.fadeForestAmbience();
      this.fadeOut();
    }
    if (timerIndex === 2) {
      this.fadeToBlack();
    }
    if (timerIndex === 3) {
      this.entity.area.game.setArea(new EndingArea());
    }
  }

  /**
   * Fade out the forest sounds as you enter the protal
   */
  private fadeForestAmbience(): void {
    const mainArea = this.entity.area.state as MainArea;
    mainArea.forestAmbience.volume = 1 - this.fadeAlpha;
  }

  /**
   * Slowly fade out to black
   */
  private fadeOut(): void {
    this.fadeAlpha = clamp(this.fadeAlpha + 0.1, 0, 1);
    if (this.fadeAlpha >= 1) {
      this.entity.clearTimer(1);
      (this.entity.area.state as MainArea).forestAmbience.stop();
      this.entity.setTimer(2, 10, true);
    }
  }

  /**
   * Fade to black after entering the portal
   */
  private fadeToBlack(): void {
    this.blackAlpha = clamp(this.blackAlpha + 0.1, 0, 1);
    if (this.blackAlpha >= 1) {
      this.entity.clearTimer(2);
      this.entity.setTimer(3, 200, false);
    }
  }

  onDraw(g2d: CanvasRenderingContext2D): void {
    g2d.globalAlpha = this.fadeAlpha;
    g2d.fillStyle = '#29004a';
    g2d.fillRect(0, 0, this.entity.area.overlayWidth, this.entity.area.overlayHeight);

    g2d.globalAlpha = this.blackAlpha;
    g2d.fillStyle = 'black';
    g2d.fillRect(0, 0, this.entity.area.overlayWidth, this.entity.area.overlayHeight);

    g2d.globalAlpha = 1;
  }
}
