import { MainArea } from 'areas/MainArea';
import { BoxCollisionMask, GroupCollisionMask, SphereCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';
import { HUD } from './HUD';
import * as THREE from 'three';

/**
 * Portal Exit
 */
export class Portal implements EntityState {
  public readonly tags: string[] = ['wall'];

  private entity: Entity<this>;
  private row: number;
  private column: number;

  // Interaction masks
  private interactMask: SphereCollisionMask;
  private exitMask: BoxCollisionMask;
  private portalObject: THREE.Object3D;

  // Animations
  private mixer: THREE.AnimationMixer;
  private portalAction: THREE.AnimationAction;

  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    // Build the object model
    const object = this.entity.area.game.assets.getObject('Portal').clone();
    object.position.copy((entity.area.state as MainArea).tileLocationToPosition(this.row, this.column));
    object.position.y = -0.5;
    object.scale.set(2, 2, 2);
    object.updateWorldMatrix(false, true);
    for (const child of object.children) {
      child.castShadow = true;
    }
    this.entity.object = object;
    this.portalObject = object.children[2];
    this.portalObject.visible = false;

    // Build collision masks
    const leftMask = new BoxCollisionMask(object.children[1]);
    const rightMask = new BoxCollisionMask(object.children[3]);
    this.entity.mask = new GroupCollisionMask(leftMask, rightMask);
    this.interactMask = new SphereCollisionMask(object.children[2]);
    this.exitMask = new BoxCollisionMask(object.children[2]);

    // Load animations
    this.mixer = new THREE.AnimationMixer(object);
    this.portalAction = this.mixer.clipAction(entity.area.game.assets.getAnimation('PortalEnergyAction'));
    this.portalAction.loop = THREE.LoopPingPong;
  }

  onDestroy(): void {}

  onStep(): void {
    this.mixer.update(0.01);

    if (!this.portalObject.visible) {
      this.testActivatePortal();
      this.handleUserMessage();
    } else {
      this.testPlayerEntersPortal();
    }
  }

  /**
   * Test if the portal should be activated (All energy collected)
   */
  private testActivatePortal(): void {
    const mainArea = this.entity.area.state as MainArea;
    if (mainArea.energyLeft === 0) {
      this.portalObject.visible = true;
      this.portalAction.play();
    }
  }

  /**
   * When to show message to the user
   */
  private handleUserMessage(): void {
    const player = this.entity.area.findFirstEntity('player');
    if (player === null || !this.interactMask.isCollidingWith(player.mask)) {
      return;
    }

    const mainArea = this.entity.area.state as MainArea;
    const hud = this.entity.area.findFirstEntity('hud') as Entity<HUD>;
    if (hud !== null && hud.state.message.length === 0) {
      hud.state.message = 'Portal requires ' + mainArea.totalEnergy + ' total energy to activate';
    }
  }

  /**
   * Test if the player has entered the portal to complete the game
   */
  private testPlayerEntersPortal(): void {
    const player = this.entity.area.findFirstEntity('player');
    if (player === null || !this.exitMask.isCollidingWith(player.mask)) {
      return;
    }

    // TODO: Actually end the game
    this.entity.area.game.setArea(new MainArea());
  }

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
