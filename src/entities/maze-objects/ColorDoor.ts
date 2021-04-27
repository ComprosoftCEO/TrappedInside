import { MainArea } from 'areas/MainArea';
import { SphereCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';
import { GamepadButton, Key } from 'engine/input';
import { DoorColor } from 'entities/DoorColor';
import { HUD } from 'entities/HUD';
import { Inventory } from 'resources/Inventory';
import { AbstractDoor } from './AbstractDoor';
import { DoorState } from 'resources/DoorState';
import * as THREE from 'three';

const DOOR_COLOR_MATERIALS: Record<DoorColor, THREE.Material> = {
  [DoorColor.Red]: new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1 }),
  [DoorColor.Yellow]: new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 1 }),
  [DoorColor.Green]: new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 1 }),
  [DoorColor.Blue]: new THREE.MeshStandardMaterial({ color: 0x0000ff, emissive: 0x0000ff, emissiveIntensity: 1 }),
};

/**
 * Door object in the maze
 */
export class ColorDoor extends AbstractDoor implements EntityState {
  public readonly tags: string[] = ['wall'];

  public readonly doorColor: DoorColor;
  private interactMask: SphereCollisionMask;

  constructor(row: number, column: number, color: DoorColor) {
    super(row, column, 'Door');
    this.doorColor = color;
  }

  onCreateDoor(): void {
    // Update the material to match the key color
    this.configureMaterialColor(this.entity.object.children[0].children[1] as THREE.Mesh);

    // Configure interaction masks
    this.interactMask = new SphereCollisionMask(this.entity.object);
  }

  /**
   * Update the door material to match the key color
   */
  private configureMaterialColor(key: THREE.Mesh): void {
    const material = DOOR_COLOR_MATERIALS[this.doorColor];
    if (typeof material !== 'undefined') {
      key.material = material;
    }
  }

  onDestroy(): void {}

  onStepDoor(): void {
    this.testForPlayerInteraction();
  }

  /**
   * See if the player is colliding so it can handle user interaction
   */
  private testForPlayerInteraction(): void {
    if (this.open) {
      return; // No more need to check
    }

    const player = this.entity.area.findFirstEntity('player');
    if (player === null || !this.interactMask.isCollidingWith(player.mask)) {
      return;
    }

    // Show HUD message
    const hud = this.entity.area.findFirstEntity('hud') as Entity<HUD>;
    const inventory = this.entity.area.game.resources.getResource<Inventory>('inventory');
    const keyAvailable = inventory.hasKeyAvailable(this.doorColor);
    if (hud !== null) {
      if (hud.state.message.length > 0) {
        return;
      }

      const color = DoorColor[this.doorColor].toLowerCase();
      hud.state.message = keyAvailable ? `Action: Use ${color} key` : `Needs a ${color} key`;
    }

    // Test for the actual action
    const input = this.entity.area.game.input;
    if ((input.isKeyStarted(Key.E) || input.isGamepadButtonStarted(0, GamepadButton.XSquare)) && keyAvailable) {
      // Use the key
      inventory.useKey(this.doorColor);
      this.openDoor();

      // Mark the door as open in the state
      const state = this.entity.area.game.resources.getResource<DoorState>('door-state');
      state.setColoredDoorOpened(this.row, this.column);

      // Play the sound
      const mainArea = this.entity.area.state as MainArea;
      mainArea.openDoor.play();
    }
  }

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
