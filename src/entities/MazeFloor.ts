import { SCALE_BASE } from 'areas/MainArea';
import { Entity, EntityState } from 'engine/entity';
import * as THREE from 'three';

const PLANE_GEOMETRY = new THREE.PlaneGeometry();
const PLANE_MATERIAL = new THREE.MeshStandardMaterial();

/**
 * Represents the floor in the maze
 */
export class MazeFloor implements EntityState {
  public readonly tags: string[] = ['wall'];

  public readonly width: number;
  public readonly height: number;

  private entity: Entity<this>;

  /**
   * Create a new plane for the floor
   *
   * @param width Number of tiles wide
   * @param height Number of tiles high
   */
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    // Load and initialize the texture
    const planeTexture = entity.area.game.assets.getTexture('GrassTexture');
    planeTexture.wrapS = THREE.RepeatWrapping;
    planeTexture.wrapT = THREE.RepeatWrapping;
    planeTexture.repeat.set(this.width * SCALE_BASE, this.height * SCALE_BASE);
    PLANE_MATERIAL.map = planeTexture;

    // Build the plane object
    this.entity.object = new THREE.Mesh(PLANE_GEOMETRY, PLANE_MATERIAL);
    this.entity.object.rotation.x = (3 * Math.PI) / 2;
    this.entity.object.scale.set(this.width * SCALE_BASE + 2, this.height * SCALE_BASE + 2, 1);
    this.entity.object.castShadow = true;
    this.entity.object.receiveShadow = true;
  }

  onDestroy(): void {}
  onStep(): void {}
  onTimer(_timerIndex: number): void {}
  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
