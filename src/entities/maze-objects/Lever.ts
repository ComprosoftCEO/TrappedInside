import { MainArea } from 'areas/MainArea';
import { SphereCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';
import { GamepadButton, Key } from 'engine/input';
import { HUD } from 'entities/HUD';
import { DoorState } from 'resources/DoorState';
import * as THREE from 'three';

/**
 * Lever that updates the toggle doors
 */
export class Lever implements EntityState {
  public readonly tags: string[] = ['lever'];

  private entity: Entity<this>;
  private row: number;
  private column: number;

  // Animations
  private mixer: THREE.AnimationMixer;
  private leverAction: THREE.AnimationAction;
  private open = false;

  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    // Configure object model
    const object = this.entity.area.game.assets.getObject('Lever').clone();
    object.position.copy((entity.area.state as MainArea).tileLocationToPosition(this.row, this.column));
    object.scale.set(1.5, 1.5, 1.5);
    object.castShadow = true;
    object.children[0].castShadow = true;
    this.entity.object = object;

    // Configure collision mask
    this.entity.mask = new SphereCollisionMask(object);

    // Load animations
    this.mixer = new THREE.AnimationMixer(object);
    this.leverAction = this.mixer.clipAction(entity.area.game.assets.getAnimation('LeverAction'));
    this.leverAction.loop = THREE.LoopOnce;
    this.leverAction.repetitions = 1;
    this.leverAction.clampWhenFinished = true;
  }

  onDestroy(): void {}

  onStep(): void {
    this.mixer.update(0.01);
    this.testForPlayerInteraction();
  }

  /**
   * See if the player is colliding so it can handle user interaction
   */
  private testForPlayerInteraction(): void {
    const player = this.entity.area.findFirstEntity('player');
    if (player === null || !this.entity.isCollidingWith(player)) {
      return;
    }

    // Draw the message
    const hud = this.entity.area.findFirstEntity('hud') as Entity<HUD>;
    if (hud !== null) {
      if (hud.state.message.length > 0 || this.leverAction.isRunning()) {
        return;
      }

      hud.state.message = 'Action: Pull Lever';
    }

    // Test if the player can interact with the lever
    if (!this.leverAction.isRunning()) {
      this.checkInteractionInput();
    }
  }

  /**
   * Toggle the action if a key is pressed
   */
  private checkInteractionInput(): void {
    const input = this.entity.area.game.input;
    if (input.isKeyStarted(Key.E) || input.isGamepadButtonStarted(0, GamepadButton.XSquare)) {
      if (this.open) {
        this.closeLever();
      } else {
        this.openLever();
      }

      const state = this.entity.area.game.resources.getResource<DoorState>('door-state');
      state.toggleDoors();
    }
  }

  /**
   * Play animation to "open" the lever
   */
  private openLever(): void {
    this.open = true;

    this.leverAction.timeScale = 1;
    this.leverAction.paused = false;
    this.leverAction.play();
  }

  /**
   * Play animation to "close" the lever
   */
  private closeLever(): void {
    this.open = false;

    this.leverAction.timeScale = -1;
    this.leverAction.time = this.leverAction.getClip().duration;
    this.leverAction.paused = false;
    this.leverAction.play();
  }

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
