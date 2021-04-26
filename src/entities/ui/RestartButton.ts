import { AbstractButton } from './AbstractButton';
import { EntityState } from 'engine/entity';
import { MainArea } from 'areas/MainArea';
import { Key, GamepadAxis, GamepadButton } from 'engine/input';

const WIDTH = 200;
const HEIGHT = 30;

/**
 * Button to start the game
 */
export class RestartButton extends AbstractButton implements EntityState {
  public readonly tags: string[] = ['restart-button'];

  constructor() {
    super('Restart');
  }

  onCreateButton(): void {
    this.x = this.entity.area.overlayWidth / 2 - WIDTH / 2;
    this.y = this.entity.area.overlayHeight - (HEIGHT + 40);
    this.width = WIDTH;
    this.height = HEIGHT;
  }

  onDestroy(): void {}

  onClick(): void {
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
