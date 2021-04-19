import { Entity, EntityState } from 'engine/entity';

export class HitAnimation implements EntityState {
  public readonly tags: string[] = ['hit-animation'];

  private entity: Entity<this>;

  onCreate(entity: Entity<this>): void {
    this.entity = entity;
    this.entity.setTimer(1, 5, false);
  }

  onDestroy(): void {}

  onStep(): void {}

  onTimer(_timerIndex: number): void {
    this.entity.destroy();
  }

  onDraw(g2d: CanvasRenderingContext2D): void {
    // Draw a red border around the screen
    g2d.globalAlpha = 0.5;
    g2d.strokeStyle = 'red';
    g2d.lineWidth = 20;

    g2d.beginPath();
    g2d.rect(0, 0, this.entity.area.overlayWidth, this.entity.area.overlayHeight);
    g2d.stroke();
  }
}
