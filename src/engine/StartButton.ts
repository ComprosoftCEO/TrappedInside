import { TitleArea } from 'areas/TitleArea';
import { AbstractButton } from './AbstractButton';
import { EntityState } from './entity';

const WIDTH = 200;
const HEIGHT = 30;

/**
 * Button to start the game
 */
export class StartButton extends AbstractButton implements EntityState {
  public readonly tags: string[] = ['start-button'];

  constructor() {
    super('Start Game');
  }

  onCreateButton(): void {
    this.x = this.entity.area.overlayWidth / 2 - WIDTH / 2;
    this.y = this.entity.area.overlayHeight - (HEIGHT + 40);
    this.width = WIDTH;
    this.height = HEIGHT;
  }

  onDestroy(): void {}

  onClick(): void {
    (this.entity.area.state as TitleArea).startGame();
  }

  onStepButton(): void {}

  onTimer(_timerIndex: number): void {}
}
