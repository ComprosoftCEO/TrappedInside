/**
 * Plain-old data class for running the timers in Area and Entity.
 * This is an internal class to the engine and should not be used directly.
 */
export class TimerEntry {
  private ticksLeft: number;
  private ticks: number;
  private looping: boolean;
  private running: boolean;

  constructor(ticks: number, looping: boolean) {
    this.ticksLeft = ticks;
    this.ticks = ticks;
    this.looping = looping;
    this.running = true;
  }

  /**
   * Test whether or not a timer is running
   * @return  Timer running
   */
  public isRunning(): boolean {
    return this.running;
  }

  /**
   * Used to pause and resume a timer
   * @param running   Set timer running
   */
  public setRunning(running: boolean): void {
    this.running = running;
  }

  /**
   * One tick on the timer. Returns true if the timer should fire.
   * @returns True if the timer should fire
   */
  public tick(): boolean {
    switch (this.ticksLeft) {
      case 0:
        return false; // No more ticks left in timer

      case 1:
        if (this.looping) {
          this.ticksLeft = this.ticks;
        } else {
          this.ticksLeft = 0;
        }
        return true;

      default:
        this.ticksLeft -= 1;
        return false; // Still waiting
    }
  }
}
