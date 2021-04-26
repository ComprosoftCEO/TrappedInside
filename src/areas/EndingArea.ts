import { Area, AreaState } from 'engine/area';
import { AudioWrapper } from 'engine/audio';
import { MouseButton } from 'engine/input';
import { TitleArea } from './TitleArea';

const LINE1 = 'Good news: the operation was successful!';
const LINE2 = 'He just awoke from the comma.';
const LINE3 = 'We expect him to make a full recovery.';

/**
 * Ending message for the game
 */
export class EndingArea implements AreaState {
  private area: Area<this>;

  private heartMonitor: AudioWrapper;
  private startTime: number;
  private alpha = 0;

  onCreate(area: Area<this>): void {
    this.area = area;

    // Load any sounds
    this.heartMonitor = this.area.createAudio('HeartMonitor');
    this.heartMonitor.volume = 0;
    this.heartMonitor.play(true);
    this.startTime = this.heartMonitor.audio.context.currentTime;
    this.area.setTimer(1, 10, true);

    // Fade in the text
    this.area.setTimer(2, 300, false);
  }

  onTimer(timerIndex: number): void {
    if (timerIndex === 1) {
      this.fadeInSound();
    }
    if (timerIndex === 2) {
      this.fadeInText();
    }
    if (timerIndex === 3) {
      this.fadeOutText();
    }
    if (timerIndex === 4) {
      this.area.game.setArea(new TitleArea());
    }
  }

  /**
   * Fade in the heart monitor sound
   */
  private fadeInSound(): void {
    this.heartMonitor.volume = Math.min(1, this.heartMonitor.volume + 0.05);
    if (this.heartMonitor.volume >= 1) {
      this.area.clearTimer(1);
    }
  }

  /**
   * Fade in the conclusion text
   */
  private fadeInText(): void {
    this.alpha = Math.min(1, this.alpha + 0.1);
    if (this.alpha >= 1) {
      this.area.clearTimer(2);
      this.area.setTimer(3, 500, false);
    } else {
      this.area.setTimer(2, 10, false);
    }
  }

  /**
   * Fade out the conclusion text
   */
  private fadeOutText(): void {
    this.alpha = Math.max(0, this.alpha - 0.05);
    this.heartMonitor.volume = Math.max(0, this.heartMonitor.volume - 0.05);

    if (this.alpha <= 0 && this.heartMonitor.volume <= 0) {
      this.area.clearTimer(3);
      this.heartMonitor.stop();
      this.heartMonitor.volume = 0;

      this.area.setTimer(4, 200, false);
    } else {
      this.area.setTimer(3, 15, false);
    }
  }

  onStep(): void {
    // Fix for audio playing
    const input = this.area.game.input;
    if (input.isMouseButtonDown(MouseButton.Left)) {
      this.heartMonitor.audio.context.resume();
    }
  }

  onDraw(g2d: CanvasRenderingContext2D): void {
    g2d.font = '20pt sans-serif';
    g2d.textAlign = 'center';
    g2d.textBaseline = 'middle';
    g2d.fillStyle = 'white';

    // Draw the text
    g2d.globalAlpha = this.alpha;
    g2d.fillText(LINE1, this.area.overlayWidth / 2, this.area.overlayHeight / 4);
    g2d.fillText(LINE2, this.area.overlayWidth / 2, this.area.overlayHeight / 2);
    g2d.fillText(LINE3, this.area.overlayWidth / 2, (3 * this.area.overlayHeight) / 4);

    // Display the heartbeat as a border
    const currentTime =
      (this.heartMonitor.audio.context.currentTime - this.startTime) % this.heartMonitor.audio.buffer.duration;
    if (currentTime >= 0.5 && currentTime < 1 && this.heartMonitor.volume > 0) {
      g2d.globalAlpha = this.heartMonitor.volume;
      g2d.beginPath();
      g2d.strokeStyle = 'green';
      g2d.lineWidth = 20;
      g2d.strokeRect(0, 0, this.area.overlayWidth, this.area.overlayHeight);
      g2d.stroke();
    }

    g2d.globalAlpha = 1;
  }
}
