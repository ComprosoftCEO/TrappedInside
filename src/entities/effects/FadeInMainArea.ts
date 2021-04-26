import { MainArea } from 'areas/MainArea';
import { FadeInEffect } from './FadeInEffect';

/**
 * Fade in the main area ambience sounds
 */
export class FadeInMainArea extends FadeInEffect {
  constructor() {
    super();
  }

  protected onTick(alpha: number): void {
    const mainArea = this.entity.area.state as MainArea;
    mainArea.forestAmbience.volume = 1 - alpha;
  }
}
