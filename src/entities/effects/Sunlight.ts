import { AbstractMazeArea, SCALE_BASE } from 'areas/AbstractMazeArea';
import { Entity, EntityState } from 'engine/entity';
import * as THREE from 'three';

/**
 * Handles the sunlight inside the maze
 */
export class Sunlight implements EntityState {
  public readonly tags: string[] = ['light'];

  private entity: Entity<this>;

  private light: THREE.DirectionalLight;
  private lightAngle = (Math.PI * 5) / 12;
  private lightDistance: number;

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    // Build the static light
    this.light = new THREE.DirectionalLight(0xffffff, 1);
    this.calculateLight();
    this.entity.object = this.light;
  }

  onDestroy(): void {}

  /**
   * Compute information about the directional light
   */
  private calculateLight(): void {
    const mazeArea = (this.entity.area.state as unknown) as AbstractMazeArea;
    const lightWidth = mazeArea.mazeWidth * SCALE_BASE;
    const lightHeight = mazeArea.mazeHeight * SCALE_BASE;

    this.light.castShadow = true;

    this.light.shadow.camera.top = lightHeight / 2;
    this.light.shadow.camera.bottom = -lightHeight / 2;
    this.light.shadow.camera.left = -lightWidth / 2;
    this.light.shadow.camera.right = lightWidth / 2;

    // We want light to cover scene when at the 45 degree angle
    //
    //                            Light
    //                              |
    // L          [Center] - - - - -R
    this.lightDistance = lightWidth / Math.cos(Math.PI / 4);
    this.updateLightAngle();

    // Speed the sun moves
    this.entity.setTimer(0, 1000, true);
  }

  onTimer(timerIndex: number): void {
    if (timerIndex === 0) {
      this.lightAngle += Math.PI / 64;
      this.lightAngle %= Math.PI; // Don't have a night
      this.updateLightAngle();
    }
  }

  /**
   * Update the angle of the sunlight in the scene
   */
  private updateLightAngle(): void {
    this.light.position.x = 0;
    this.light.position.y = this.lightDistance * Math.sin(this.lightAngle);
    this.light.position.z = -this.lightDistance * Math.cos(this.lightAngle);
  }

  onStep(): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
