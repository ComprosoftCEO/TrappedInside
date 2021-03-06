import { AbstractButton } from './AbstractButton';
import { EntityState } from 'engine/entity';
import { IntroArea } from 'areas/IntroArea';
import { MainArea } from 'areas/MainArea';
import { GamepadAxis, GamepadButton, Key } from 'engine/input';

const WIDTH = 50;
const HEIGHT = 30;

/**
 * Button to skip the intro
 */
export class SkipIntroButton extends AbstractButton implements EntityState {
  public readonly tags: string[] = ['skip-button'];

  constructor() {
    super('Skip');
  }

  onCreateButton(): void {
    this.x = this.entity.area.overlayWidth - WIDTH - 20;
    this.y = this.entity.area.overlayHeight - HEIGHT - 20;
    this.width = WIDTH;
    this.height = HEIGHT;
  }

  onDestroy(): void {}

  onClick(): void {
    (this.entity.area.state as IntroArea).introMusic.stop();
    this.entity.area.game.setArea(new MainArea());
  }

  onStepButton(): void {
    const input = this.entity.area.game.input;
    if (
      input.isKeyStarted(Key.Enter) ||
      input.isKeyStarted(Key.Space) ||
      input.isGamepadButtonStarted(0, GamepadButton.ACross) ||
      input.isGamepadButtonStarted(0, GamepadButton.XSquare) ||
      input.isGamepadButtonStarted(0, GamepadButton.YTriangle) ||
      input.isGamepadButtonStarted(0, GamepadButton.Start) ||
      input.getGamepadAxis(0, GamepadAxis.RightTrigger) > 0.5
    ) {
      this.onClick();
    }
  }

  onTimer(_timerIndex: number): void {}
}
