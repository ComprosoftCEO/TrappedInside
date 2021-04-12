import { SphereCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';

/**
 * Bullet that is fired from a space ship
 */
export class Bullet implements EntityState {
  public readonly tags: string[] = ['bullet'];

  private entity: Entity<this>;
  private angle: number;

  constructor(angle: number) {
    this.angle = angle;
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    // Load the object
    entity.object = entity.area.game.assets.getObject('Bullet').clone();
    entity.object.position.y = 0.5;
    entity.object.rotation.y = this.angle;
    entity.object.updateMatrix();

    entity.mask = new SphereCollisionMask(entity.object);
    (entity.mask as SphereCollisionMask).sphere.radius = 0.5;

    // Destroy after a certain amount of time
    entity.setTimer(0, 120);
  }

  onDestroy(): void {}

  onStep(): void {
    this.entity.object.translateX(0.5);
    (this.entity.mask as SphereCollisionMask).sphere.center.copy(this.entity.object.position);
  }

  onTimer(_timerIndex: number): void {
    this.entity.destroy();
  }

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
