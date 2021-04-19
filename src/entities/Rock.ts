import { MainArea, SCALE_BASE } from 'areas/MainArea';
import { MazeObject } from 'areas/MazeObject';
import { BoxCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';
import { Explosion } from './Explosion';

const HEALTH = 10;

/**
 * Rock blocking the maze
 */
export class Rock implements EntityState {
  public readonly tags: string[] = ['rock'];

  private entity: Entity<this>;
  private row: number;
  private column: number;

  private health = HEALTH;

  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    const object = entity.area.game.assets.getObject('Rock').clone();
    object.scale.set(SCALE_BASE / 2, SCALE_BASE / 2, SCALE_BASE / 2);
    object.position.copy((entity.area.state as MainArea).tileLocationToPosition(this.row, this.column));
    object.castShadow = true;

    this.entity.object = object;
    this.entity.mask = new BoxCollisionMask(object);
  }

  onDestroy(): void {
    const mainArea = this.entity.area.state as MainArea;
    mainArea.maze[this.row][this.column] = MazeObject.Empty;
  }

  onStep(): void {
    this.checkForBulletCollision();
    this.checkHealth();
  }

  /**
   * Check for collisions with any of the player bullets
   */
  private checkForBulletCollision(): void {
    for (const bullet of this.entity.area.findEntities('player-bullet')) {
      if (this.entity.isCollidingWith(bullet)) {
        bullet.destroy();
        this.health -= 1;
      }
    }
  }

  /**
   * Check if the health has destroyed the rock
   */
  private checkHealth(): void {
    if (this.health <= 0) {
      this.entity.destroy();

      // Spawn the explosion
      const explosionPos = this.entity.object.position.clone();
      explosionPos.y += SCALE_BASE / 4;
      this.entity.area.createEntity(new Explosion(explosionPos, SCALE_BASE / 2));
    }
  }

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
