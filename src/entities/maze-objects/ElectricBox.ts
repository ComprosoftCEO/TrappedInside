import { MainArea } from 'areas/MainArea';
import { BoxCollisionMask, SphereCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';
import { ElectricBoxType } from 'entities/ElectricBoxType';
import { GamepadButton, Key } from 'engine/input';
import { HUD } from 'entities/HUD';
import { Inventory } from 'resources/Inventory';
import { DoorState } from 'resources/DoorState';
import * as THREE from 'three';

/**
 * Box to open and close electric doors
 */
export class ElectricBox implements EntityState {
  public readonly tags: string[] = ['electric-box', 'wall'];

  private entity: Entity<this>;

  private row: number;
  private column: number;
  private type: ElectricBoxType;

  // Flag to indicate if battery is in the system
  private hasBattery = false;
  private interactMask: SphereCollisionMask;

  // Animations
  private mixer: THREE.AnimationMixer;
  private insertBattery: THREE.AnimationAction;
  private spinWheel: THREE.AnimationAction;
  private batteryObject: THREE.Object3D;

  constructor(row: number, column: number, type: ElectricBoxType) {
    this.row = row;
    this.column = column;
    this.type = type;
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    // Configure object model
    const object = this.entity.area.game.assets.getObject('ElectricBox').clone();
    object.position.copy((entity.area.state as MainArea).tileLocationToPosition(this.row, this.column));
    object.children[0].castShadow = true;
    object.children[3].castShadow = true;
    this.batteryObject = object.children[2];
    this.batteryObject.visible = false;
    this.entity.object = object;

    // Configure object masks
    this.entity.mask = new BoxCollisionMask(object);
    this.interactMask = new SphereCollisionMask(object);
    this.interactMask.sphere.radius *= 1.5;

    // Load animations
    this.mixer = new THREE.AnimationMixer(object);

    this.insertBattery = this.mixer.clipAction(entity.area.game.assets.getAnimation('BatteryAction'));
    this.insertBattery.loop = THREE.LoopOnce;
    this.insertBattery.clampWhenFinished = true;

    this.spinWheel = this.mixer.clipAction(entity.area.game.assets.getAnimation('WheelAction'));
    this.spinWheel.loop = THREE.LoopRepeat;
    this.spinWheel.repetitions = Infinity;
    this.spinWheel.paused = true;
    this.spinWheel.play();
  }

  onDestroy(): void {}

  onStep(): void {
    this.mixer.update(0.01);
    this.testForPlayerInteraction();

    // Trigger: called ONE time after the battery has been inserted
    if (this.hasBattery && !this.insertBattery.isRunning() && !this.spinWheel.isRunning()) {
      // Start the animation
      this.spinWheel.paused = false;

      // Mark door as powered
      const state = this.entity.area.game.resources.getResource<DoorState>('door-state');
      state.setDoorPowered(this.type, true);

      // Play the power-up sound
      const mainArea = this.entity.area.state as MainArea;
      mainArea.electricBox.volume = 0.25;
      mainArea.electricBox.play();
    }

    // Trigger: called ONE time after the battery has been removed
    if (!this.hasBattery && !this.insertBattery.isRunning() && this.batteryObject.visible) {
      // Hide the battery
      this.batteryObject.visible = false;

      // Collect the battery again
      const inventory = this.entity.area.game.resources.getResource<Inventory>('inventory');
      inventory.collectBattery();
    }
  }

  /**
   * See if the player is colliding so it can handle user interaction
   */
  private testForPlayerInteraction(): void {
    const player = this.entity.area.findFirstEntity('player');
    if (player === null || !this.interactMask.isCollidingWith(player.mask)) {
      return;
    }

    // Draw the message
    const hud = this.entity.area.findFirstEntity('hud') as Entity<HUD>;
    if (hud !== null) {
      const inventory = this.entity.area.game.resources.getResource<Inventory>('inventory');
      if (hud.state.message.length > 0 || this.insertBattery.isRunning()) {
        return;
      }

      if (this.hasBattery) {
        hud.state.message = 'Action: Take Battery';
      } else {
        hud.state.message = inventory.hasCollectedBattery() ? 'Action: Insert Battery' : 'Needs a battery for power';
      }
    }

    // Test if the player can interact with the box
    if (!this.insertBattery.isRunning()) {
      this.checkInteractionInput();
    }
  }

  /**
   * Toggle the action if a key is pressed
   */
  private checkInteractionInput(): void {
    const input = this.entity.area.game.input;
    if (input.isKeyStarted(Key.E) || input.isGamepadButtonStarted(0, GamepadButton.XSquare)) {
      const inventory = this.entity.area.game.resources.getResource<Inventory>('inventory');
      if (this.hasBattery) {
        // Stop spinning the wheel
        this.spinWheel.paused = true;

        // Reverse animation
        this.insertBattery.timeScale = -1;
        this.insertBattery.paused = false;
        this.insertBattery.play();

        // Mark door as unpowered
        const state = this.entity.area.game.resources.getResource<DoorState>('door-state');
        state.setDoorPowered(this.type, false);

        // Indicate no battery
        this.hasBattery = false;

        // Play the power-off sound
        const mainArea = this.entity.area.state as MainArea;
        mainArea.toggleLever.play();
        mainArea.openDoor.play();
      } else if (inventory.hasCollectedBattery()) {
        // Insert animation
        this.insertBattery.timeScale = 1;
        this.batteryObject.visible = true;
        this.insertBattery.paused = false;
        this.insertBattery.play();

        // Indicate battery
        inventory.useBattery();
        this.hasBattery = true;
      }
    }
  }

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
