import { MainArea } from 'areas/MainArea';
import { FadeOutEffect } from './FadeOutEffect';

/**
 * Fade the screen to black if the player dies
 */
export class DeathAnimation extends FadeOutEffect {
  protected onTick(alpha: number): void {}

  protected onFinish(): void {
    this.entity.area.game.setArea(new MainArea());
  }
}
