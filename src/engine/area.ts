import { Game } from 'engine/game';
import { Entity, EntityState } from 'engine/entity';
import { TimerEntry } from './timerEntry';
import * as THREE from 'three';
import { AudioWrapper } from './audio';
import { PositionalAudio } from 'three';

/**
 * Methods required to encapsulate an area in the game
 */
export interface AreaState {
  /// Returns the newly created area object for the AreaState to store
  onCreate(area: Area<this>): void;

  onTimer(timerIndex: number): void;
  onStep(): void;
  onDraw(g2d: CanvasRenderingContext2D): void;
}

/**
 * Represents a collection of 3D objects in a single "Scene".
 *
 * This class is constructed by the game engine,
 *  so you don't need to worry about creating this manually.
 */
export class Area<State extends AreaState = AreaState> {
  public readonly game: Game;
  public readonly state: State;
  public readonly scene: THREE.Scene;

  /* Handle audio in the scene */
  public readonly audioListener: THREE.AudioListener;

  // Has custom get/set methods to update the audio listener
  private _camera: THREE.Camera;

  /* List of all entities in the scene */
  private readonly allEntities = new Set<Entity>();
  private readonly taggedEntities = new Map<string, Set<Entity>>();

  /* List of entities to create after the next game "tick" */
  private toCreate = new Set<Entity>();

  /* Handle timers */
  private readonly timers = new Map<number, TimerEntry>();

  /**
   * This class is constructed by the game engine,
   *  so you don't need to worry about creating this manually.
   */
  constructor(game: Game, state: State) {
    this.game = game;
    this.state = state;

    this.scene = new THREE.Scene();
    this.audioListener = new THREE.AudioListener();
    this._camera = new THREE.PerspectiveCamera();
    this._camera.add(this.audioListener);
  }

  /**
   * Get the main camera used by the scene
   */
  public get camera(): THREE.Camera {
    return this._camera;
  }

  /**
   * Update the main camera used by the scene.
   * Also updates the AudioManager for this scene.
   */
  public set camera(newCamera: THREE.Camera) {
    this._camera.remove(this.audioListener);
    newCamera.add(this.audioListener);
    this._camera = newCamera;
  }

  /**
   * Create a new entity on the next game tick.
   *
   * Although it returns an entity object, this entity will not actually
   *  be in the room until the next game tick.
   *
   * @param entity Entity to create
   * @returns The newly created entity object
   */
  public createEntity<T extends EntityState>(entity: T): Entity<T> {
    const newEntity = new Entity(this, entity);
    this.toCreate.add(newEntity);
    return newEntity;
  }

  /**
   * Get the list of all entities in the scene
   * @returns Array of all entities
   */
  public getAllEntities(): Entity[] {
    return Array.from(this.allEntities);
  }

  /**
   * Find all entities that have the given string tag
   *
   * @param tag String tag to search for
   * @returns List of all entities that have this tag
   */
  public findEntities(tag: string): Entity[] {
    if (!this.taggedEntities.has(tag)) {
      return [];
    }
    return Array.from(this.taggedEntities.get(tag));
  }

  /**
   * Find the first instance of the entity, or null if there are no instances
   *
   * @param tag String tag to search for
   * @return    First found entity that match the tag, or null
   */
  public findFirstEntity(tag: string): Entity | null {
    if (!this.taggedEntities.has(tag)) {
      return null;
    }

    const entities = this.taggedEntities.get(tag);
    const firstEntry = entities.values().next();
    if (firstEntry.done) {
      return null;
    } else {
      return firstEntry.value;
    }
  }

  /**
   * Set a timer to fire after a certain number of game ticks.
   *  Safe to call from within the timerFired() event handler.
   *
   * @param index    Unique index for the timer
   * @param ticks    Number of ticks to wait. Minimum is 1.
   * @param looping  Should timer loop forever?
   */
  public setTimer(index: number, ticks: number, looping: boolean): void {
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
   * Helper method to construct a new audio from an AudioBuffer or asset name.
   * Uses the camera as the listener for this audio.
   *
   * @param buffer Audio buffer or audio asset name
   * @returns Newly constructed audio
   */
  public createAudio(buffer: AudioBuffer | string): AudioWrapper<THREE.Audio> {
    const audio = new THREE.Audio(this.audioListener);
    if (buffer instanceof AudioBuffer) {
      audio.buffer = buffer;
    } else if (typeof buffer === 'string') {
      audio.buffer = this.game.assets.getAudio(buffer);
    }

    return new AudioWrapper(audio);
  }

  /**
   * Helper method to construct a new positional audio from an AudioBuffer or an asset name.
   * Uses the camera as the listener for this audio.
   *
   * @param buffer Audio buffer or audio asset name
   * @returns Newly constructed audio
   */
  public createPositionalAudio(buffer: AudioBuffer | string): AudioWrapper<PositionalAudio> {
    const audio = new THREE.PositionalAudio(this.audioListener);
    if (buffer instanceof AudioBuffer) {
      audio.buffer = buffer;
    } else if (typeof buffer === 'string') {
      audio.buffer = this.game.assets.getAudio(buffer);
    }

    return new AudioWrapper(audio);
  }

  // ==== Internal Methods Listed Below ====

  /**
   * Run the onTimer() event handlers for this area.
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
   * Create all entities inside the buffer
   *
   * This method is used internally by the game engine and
   *  should NOT be called directly!
   */
  _createEntities(): void {
    if (this.toCreate.size === 0) {
      return;
    }

    // Add every entity to the map
    for (const entity of this.toCreate) {
      this.addEntityToArea(entity);
    }

    // Clear the list of created entities
    const created = this.toCreate;
    this.toCreate = new Set();

    // Call the "onCreate" handler for each new entity
    for (const entity of created) {
      entity._create();
    }
  }

  /// Update the internal maps and sets with the new entity
  private addEntityToArea(entity: Entity): void {
    this.allEntities.add(entity);

    for (const tag of entity.state.tags) {
      this.addTaggedEntityToMap(entity, tag);
    }
  }

  /// Add the entity to one of the corresponding set tags
  private addTaggedEntityToMap(entity: Entity, tag: string): void {
    if (!this.taggedEntities.has(tag)) {
      this.taggedEntities.set(tag, new Set());
    }

    const set = this.taggedEntities.get(tag);
    set.add(entity);
  }

  /**
   * Destroy all entities marked for deletion.
   *
   * This method is used internally by the game engine and
   *  should NOT be called directly!
   */
  _destroyEntities(): void {
    // Get all entities marked for deletion
    const toDestroy = [];
    for (const entity of this.allEntities) {
      if (entity.isDestroyed) {
        toDestroy.push(entity);
      }
    }

    // Actually remove the entities
    for (const entity of toDestroy) {
      this.removeEntityFromArea(entity);
    }

    // Call the "onDestroy" event handler for each entity
    for (const entity of toDestroy) {
      entity._destroy();
    }
  }

  /// Update the internal maps and sets to no longer store the entity
  private removeEntityFromArea(entity: Entity): void {
    this.allEntities.delete(entity);

    for (const tag of entity.state.tags) {
      this.removeTaggedEntityFromMap(entity, tag);
    }
  }

  /// Remove the entity to one of the corresponding set tags
  private removeTaggedEntityFromMap(entity: Entity, tag: string): void {
    if (!this.taggedEntities.has(tag)) {
      return;
    }

    const set = this.taggedEntities.get(tag);
    set.delete(entity);
  }

  /**
   * Run the onTimer() event handler for all entities.
   *
   * This method is used internally by the game engine and
   *  should NOT be called directly!
   */
  _tickEntityTimers(): void {
    for (const entity of this.allEntities) {
      entity._tickTimers();
    }
  }

  /**
   * Run the onStep() event handler for all entities.
   *
   * This method is used internally by the game engine and
   *  should NOT be called directly!
   */
  _stepEntities(): void {
    for (const entity of this.allEntities) {
      entity._step();
    }
  }

  /**
   * Run the scene in THREE.js, then draw over any other elements
   *
   * This method is used internally by the game engine and
   *  should NOT be called directly!
   */
  _drawScene(renderer: THREE.Renderer, g2d: CanvasRenderingContext2D): void {
    // Add all of the collision masks to the scene
    for (const entity of this.allEntities) {
      entity.mask._drawMask(this.scene);
    }

    // Render the scene itself
    renderer.render(this.scene, this.camera);

    // Draw any overlays
    this.state.onDraw(g2d);
    for (const entity of this.allEntities) {
      entity._draw(g2d);
    }
  }
}
