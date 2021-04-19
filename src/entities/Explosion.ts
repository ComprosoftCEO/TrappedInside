import { Entity, EntityState } from 'engine/entity';

/**
 * Explosion Effect
 */
export class Explosion implements EntityState {
  public readonly tags: string[] = ['explosion'];

  private entity: Entity<this>;
  private position: THREE.Vector3;
  private scale: number;
  private scaleAnimation = Math.PI / 2;

  /**
   * Create a new explosion effect
   *
   * @param position World (X,Y,Z) location of the explosion
   * @param scale Size of the explosion
   */
  constructor(position: THREE.Vector3, scale: number) {
    this.position = position;
    this.scale = scale;
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    const object = this.entity.area.game.assets.getObject('Explosion').clone();
    object.position.copy(this.position);
    object.scale.set(this.scale, this.scale, this.scale);
    this.entity.object = object;
  }

  onDestroy(): void {}

  onStep(): void {
    // Scale the explosion to create a cool animation
    const newScale = this.scale * Math.sin(this.scaleAnimation);
    this.entity.object.scale.set(newScale, newScale, newScale);
    this.scaleAnimation += Math.PI / 24;

    // Destory after a given amount of time
    if (this.scaleAnimation > Math.PI) {
      this.entity.destroy();
    }
  }

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
