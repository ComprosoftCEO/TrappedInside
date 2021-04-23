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
    PLANE_MATERIAL.map = this.buildTexture('GrassColor');
    PLANE_MATERIAL.normalMap = this.buildTexture('GrassNormal');
    PLANE_MATERIAL.aoMap = this.buildTexture('GrassOcclusion');

    // Build the plane object
    this.entity.object = new THREE.Mesh(PLANE_GEOMETRY, PLANE_MATERIAL);
    this.entity.object.rotation.x = (3 * Math.PI) / 2;
    this.entity.object.scale.set(this.width * SCALE_BASE + 2, this.height * SCALE_BASE + 2, 1);
    this.entity.object.castShadow = true;
    this.entity.object.receiveShadow = true;
  }

  /**
   * Load a wall texture and configure texture scaling and repeating
   */
  private buildTexture(name: string): THREE.Texture {
    const texture = this.entity.area.game.assets.getTexture(name);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set((SCALE_BASE * this.width) / 2, (SCALE_BASE * this.height) / 2);
    texture.offset.set(0.5, 0.5);
    texture.rotation = Math.PI / 6;
    return texture;
  }

  onDestroy(): void {}
  onStep(): void {}
  onTimer(_timerIndex: number): void {}
  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
