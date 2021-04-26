import { GameOverArea } from 'areas/GameOverArea';
import { MainArea } from 'areas/MainArea';
import { FadeOutEffect } from './FadeOutEffect';

/**
 * Fade the screen to black if the player dies
 */
export class DeathAnimation extends FadeOutEffect {
  protected onTick(alpha: number): void {
    const mainArea = this.entity.area.state as MainArea;
    mainArea.forestAmbience.volume = 1 - alpha;
  }

  protected onFinish(): void {
    const mainArea = this.entity.area.state as MainArea;
    mainArea.forestAmbience.stop();
    this.entity.area.game.setArea(new GameOverArea());
  }
}
