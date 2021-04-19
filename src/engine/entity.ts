import * as THREE from 'three';
import { Area } from 'engine/area';
import { TimerEntry } from './timerEntry';
import { CollisionMask, EmptyCollisionMask } from './collision';

/**
 * Each entity in the game must implement the entity state
 */
export interface EntityState {
  /// List of tags to query entities in an area
  /// Set this to a constant value on object initialization.
  readonly tags: string[];

  /// Returns the newly created entity for the EntityState to store
  onCreate(entity: Entity<this>): void;

  onDestroy(): void;
  onStep(): void;
  onTimer(timerIndex: number): void;
  onDraw(g2d: CanvasRenderingContext2D): void;
}

/**
 * Represents a single object in an area that has interaction.
 *
 * This class is constructed by the game engine,
 *  so you don't need to worry about creating this manually.
 */
export class Entity<State extends EntityState = EntityState> {
  public readonly area: Area;
  public readonly state: State;
  public mask: CollisionMask;

  /* Internal state objects */
  private readonly timers = new Map<number, TimerEntry>();
  private _isDestroyed = false;
  private _object: THREE.Object3D | null = null;

  /**
   * This class is constructed by the game engine,
   *  so you don't need to worry about creating this manually.
   */
  constructor(area: Area, state: State) {
    this.area = area;
    this.state = state;
    this.mask = new EmptyCollisionMask();
  }

  /**
   * Mark this entity to be destroyed on the next game tick
   */
  public destroy(): void {
    this._isDestroyed = true;
  }

  /**
   * @returns Returns true if this entity has already been destroyed
   */
  public get isDestroyed(): boolean {
    return this._isDestroyed;
  }

  /**
   * Get the 3D object associated with this entity
   */
  public get object(): THREE.Object3D | null {
    return this._object;
  }

  /**
   * Replace the 3D object associated with this entity
   */
  public set object(object: THREE.Object3D | null) {
    // Remove the old object, if it exists
    if (this._object !== null) {
      this.area.scene.remove(this._object);
    }

    // Load the new object
    if (object !== null) {
      this.area.scene.add(object);
    }
    this._object = object;
  }

  /**
   * Set a timer to fire after a certain number of game ticks.
   *  Safe to call from within the timerFired() event handler.
   *
   * @param index    Unique index for the timer
   * @param ticks    Number of ticks to wait. Minimum is 1.
   * @param looping  Should timer loop forever?
   */
  public setTimer(index: number, ticks: number, looping = false): void {
    if (ticks < 1) {
      return;
    }
    this.timers.set(index, new TimerEntry(ticks, looping));
  }

  /**
   * Clear and remove the timer.
   *  Safe to call from within the timerFired() method.
   *
   * @param index   Unique index for the timer
   */
  public clearTimer(index: number): void {
    this.timers.delete(index);
  }

  /**
   * Test if two entities are colliding with each other
   *
   * @param other Other entity to check
   * @returns True if they are colliding, false otherwise
   */
  public isCollidingWith(other: Entity<EntityState>): boolean {
    return this.mask.isCollidingWith(other.mask);
  }

  // ==== Internal Methods Listed Below ====

  /**
   * Run the onCreate() event handler.
   *
   * This method is used internally by the game engine and
   *  should NOT be called directly!
   */
  _create(): void {
    this.state.onCreate(this);
  }

  /**
   * Run the onDestroy() event handler.
   *
   * This method is used internally by the game engine and
   *  should NOT be called directly!
   */
  _destroy(): void {
    this.state.onDestroy();
    this.mask.showMask = false; /* Clean up mask resources */

    if (this._object !== null) {
      this.area.scene.remove(this._object);
    }
  }

  /**
   * Run the onTimer() event handlers for this entity.
   *
   * This method is used internally by the game engine and
   *  should NOT be called directly!
   */
  _tickTimers(): void {
    const timersFired = [];
    for (const [index, timer] of this.timers) {
      if (timer.isRunning()) {
        if (timer.tick()) {
          timersFired.push(index);
        }
      }
    }

    for (const index of timersFired) {
      this.state.onTimer(index);
    }
  }

  /**
   * Run the onStep() event handler.
   *
   * This method is used internally by the game engine and
   *  should NOT be called directly!
   */
  _step(): void {
    this.state.onStep();
  }

  /**
   * Run the onDraw() event handler.
   *
   * This method is used internally by the game engine and
   *  should NOT be called directly!
   */
  _draw(g2d: CanvasRenderingContext2D): void {
    this.state.onDraw(g2d);
  }
}
