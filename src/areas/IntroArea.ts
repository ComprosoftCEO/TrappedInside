import { Area, AreaState } from 'engine/area';
import { AudioWrapper } from 'engine/audio';
import { MouseButton } from 'engine/input';
import { SkipIntroButton } from 'entities/ui/SkipIntroButton';
import { MainArea } from './MainArea';

const LEFT_X = 40;
const LINE1_1 = 'I remember... ';
const LINE1_2 = 'I was having a dream...';
const LINE2 = 'I was trapped inside a massive labyrinth...';
const LINE3 = 'But the funny thing is...';

// eslint-disable-next-line quotes
const FINAL_LINE = "I don't recall ever waking up from that dream...";

// Animation frames
const FADE_IN_SPEEDS: number[] = [5, 5, 5, 5, 5, 5, 5];
const FADE_IN_ALPHA: number[] = [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05];
const FADE_IN_DELAYS: number[] = [150, 200, 400, 250, 300, 180, 10];

/**
 * Draws the game introduction
 */
export class IntroArea implements AreaState {
  private area: Area<this>;

  public introMusic: AudioWrapper;
  private alpha: number[] = [0, 0, 0, 0, 0, 0, 0];

  private shouldDrawFinalLine(): boolean {
    return this.alpha[5] > 0;
  }

  onCreate(area: Area<this>): void {
    this.area = area;

    this.area.createEntity(new SkipIntroButton());
    this.area.game.input.pointerLockEnabled = false;

    // Load any sounds
    this.introMusic = this.area.createAudio('Intro');
    this.introMusic.volume = 0;
    this.introMusic.play(true);
    this.area.setTimer(1, 100, false);

    // Fade in timer
    this.area.setTimer(2, 200, false);
  }

  onTimer(timerIndex: number): void {
    if (timerIndex === 1) {
      this.increaseVolume();
    }
    if (timerIndex >= 2 && timerIndex <= 8) {
      this.handleFadeIn(timerIndex, timerIndex - 2);
    }
    if (timerIndex === 7) {
      this.decreaseVolume();
    }
    if (timerIndex === 9) {
      this.area.game.setArea(new MainArea());
    }
  }

  /**
   * Increase the volume of the intro music
   */
  private increaseVolume(): void {
    this.introMusic.volume = Math.min(1, this.introMusic.volume + 0.1);
    if (this.introMusic.volume === 1) {
      this.area.clearTimer(1);
    } else {
      this.area.setTimer(1, 10, false);
    }
  }

  /**
   * Slowly decrease the volume
   */
  private decreaseVolume(): void {
    this.introMusic.volume = Math.max(0, this.introMusic.volume - FADE_IN_ALPHA[4]);
    if (this.introMusic.volume <= FADE_IN_ALPHA[4]) {
      this.introMusic.stop();
    }
  }

  /**
   * Handle the fade in animation
   */
  private handleFadeIn(timerIndex: number, alphaIndex: number): void {
    if (this.alpha[alphaIndex] === 1) {
      this.area.clearTimer(timerIndex);
      this.area.setTimer(timerIndex + 1, FADE_IN_DELAYS[alphaIndex], false);
      return;
    }

    this.alpha[alphaIndex] = Math.min(1, this.alpha[alphaIndex] + FADE_IN_ALPHA[alphaIndex]);
    if (alphaIndex > 1) {
      this.alpha[alphaIndex - 1] = Math.max(0, this.alpha[alphaIndex - 1] - FADE_IN_ALPHA[alphaIndex]);
      this.alpha[alphaIndex - 2] = Math.max(0, this.alpha[alphaIndex - 2] - FADE_IN_ALPHA[alphaIndex]);
    }
    this.area.setTimer(timerIndex, FADE_IN_SPEEDS[alphaIndex], false);
  }

  onStep(): void {
    // Fix for audio playing
    const input = this.area.game.input;
    if (input.isMouseButtonDown(MouseButton.Left)) {
      this.introMusic.audio.context.resume();
    }
  }

  onDraw(g2d: CanvasRenderingContext2D): void {
    if (this.shouldDrawFinalLine()) {
      this.drawFinalLine(g2d);
    } else {
      this.drawThreeLines(g2d);
    }
  }

  /**
   * Draw the three-line intro
   */
  private drawThreeLines(g2d: CanvasRenderingContext2D): void {
    g2d.font = '24pt sans-serif';
    g2d.textAlign = 'left';
    g2d.textBaseline = 'middle';
    g2d.fillStyle = 'white';

    const topLine = this.area.overlayHeight / 3 - this.area.overlayHeight / 6;
    const middleLine = topLine + this.area.overlayHeight / 3;
    const bottomLine = middleLine + this.area.overlayHeight / 3;

    g2d.globalAlpha = this.alpha[0];
    g2d.fillText(LINE1_1, LEFT_X, topLine);

    const metrics = g2d.measureText(LINE1_1);
    g2d.globalAlpha = this.alpha[1];
    g2d.fillText(LINE1_2, LEFT_X + metrics.width, topLine);

    g2d.globalAlpha = this.alpha[2];
    g2d.fillText(LINE2, LEFT_X, middleLine);

    g2d.globalAlpha = this.alpha[3];
    g2d.fillText(LINE3, LEFT_X, bottomLine);
  }

  /**
   * Draw the single line intro
   */
  private drawFinalLine(g2d: CanvasRenderingContext2D): void {
    g2d.font = '24pt sans-serif';
    g2d.textAlign = 'center';
    g2d.textBaseline = 'middle';
    g2d.fillStyle = 'white';

    g2d.globalAlpha = this.alpha[5];
    g2d.fillText(FINAL_LINE, this.area.overlayWidth / 2, this.area.overlayHeight / 2);
  }
}
