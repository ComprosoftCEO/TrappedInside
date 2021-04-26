import { IntroArea } from 'areas/IntroArea';
import { TitleArea } from 'areas/TitleArea';
import { FadeOutEffect } from './FadeOutEffect';

/**
 * Fade out the title screen and start the animation
 */
export class StartIntroduction extends FadeOutEffect {
  constructor() {
    super(10);
  }

  protected onTick(alpha: number): void {
    const titleArea = this.entity.area.state as TitleArea;
    titleArea.titleMusic.volume = 1 - alpha;
  }

  protected onFinish(): void {
    const titleArea = this.entity.area.state as TitleArea;
    titleArea.titleMusic.stop();

    this.entity.area.game.setArea(new IntroArea());
  }
}
