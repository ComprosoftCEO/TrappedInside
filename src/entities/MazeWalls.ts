import { MainArea, SCALE_BASE, SCALE_HEIGHT } from 'areas/MainArea';
import { Area } from 'engine/area';
import { BoxCollisionMask, GroupCollisionMask } from 'engine/collision';
import { Entity, EntityState } from 'engine/entity';
import * as THREE from 'three';

const BOX_GEOMETRY = new THREE.BoxGeometry(1, 1, 1);
const BOX_MATERIAL = new THREE.MeshStandardMaterial();
const DEFAULT_BOX3 = new THREE.Box3(new THREE.Vector3(-0.5, -0.5, -0.5), new THREE.Vector3(0.5, 0.5, 0.5));

/**
 * Single entity to represent all maze walls under one entity
 */
export class MazeWalls implements EntityState {
  public readonly tags: string[] = ['wall'];

  private entity: Entity<this>;

  private walls: THREE.InstancedMesh;
  private mask: GroupCollisionMask;
  private currentWall = 0;

  private startX: number;
  private endZ: number;

  constructor(numWalls: number, area: Area<MainArea>) {
    this.mask = new GroupCollisionMask();
    this.startX = 0 - SCALE_BASE * Math.floor(area.state.mazeHeight / 2);
    this.endZ = SCALE_BASE * Math.floor(area.state.mazeWidth / 2);

    // Initialize the box material
    BOX_MATERIAL.map = this.buildWallTexture('BrickColor', area);
    BOX_MATERIAL.normalMap = this.buildWallTexture('BrickNormal', area);
    BOX_MATERIAL.aoMap = this.buildWallTexture('BrickOcclusion', area);
    BOX_MATERIAL.side = THREE.FrontSide;

    // Create instances for all walls
    this.walls = new THREE.InstancedMesh(BOX_GEOMETRY, BOX_MATERIAL, numWalls);
    this.walls.castShadow = true;
    this.walls.receiveShadow = true;
  }

  /**
   * Load a wall texture and configure texture scaling and repeating
   */
  private buildWallTexture(name: string, area: Area<MainArea>): THREE.Texture {
    const texture = area.game.assets.getTexture(name);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, SCALE_HEIGHT / SCALE_BASE);
    return texture;
  }

  /**
   * Set a given X,Z coordinate to be a wall
   *
   *        N [+X]
   *
   * W [-Z]      [+Z] E
   *
   *        X [-X]
   *
   * Notice that we have to flip Z because THREE.js puts +Z on the left
   */
  public addWall(x: number, z: number): void {
    if (this.currentWall >= this.walls.count) {
      return;
    }

    // Set the wall translation value
    const matrix = new THREE.Matrix4();
    matrix.makeTranslation(this.startX + x * SCALE_BASE, SCALE_HEIGHT / 2 - 1, this.endZ - z * SCALE_BASE);
    matrix.scale(new THREE.Vector3(SCALE_BASE, SCALE_HEIGHT, SCALE_BASE));
    this.walls.setMatrixAt(this.currentWall, matrix);

    // Also generate a collision mask
    const box = DEFAULT_BOX3.clone();
    box.applyMatrix4(matrix);
    this.mask.addMask(new BoxCollisionMask(box));

    this.currentWall += 1;
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    this.walls.instanceMatrix.needsUpdate = true;
    this.entity.object = this.walls;
    this.entity.mask = this.mask;
  }

  onDestroy(): void {}

  onStep(): void {}

  onTimer(_timerIndex: number): void {}

  onDraw(_g2d: CanvasRenderingContext2D): void {}
}
