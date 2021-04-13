import * as THREE from 'three';

// Geometries to draw collision masks
const WIREFRAME_MATERIAL = new THREE.LineBasicMaterial({ color: 0xffffff });
const SPHERE_GEOMETRY = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1, 2));

// Build the box geometry line segments manually
const BOX_GEOMETRY_INDICES = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]);
const BOX_GEOETRY_VERTICES = new THREE.Float32BufferAttribute(
  [1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1],
  3,
);
const BOX_GEOMETRY = new THREE.BufferGeometry()
  .setIndex(new THREE.BufferAttribute(BOX_GEOMETRY_INDICES, 1))
  .setAttribute('position', BOX_GEOETRY_VERTICES);

/**
 * Represents a generic type of collision mask.
 *
 * Collisions in the game engine are either boxes or spheres.
 * Additionally, there is a CollisionMaskGroup that can check for multiple collision masks.
 */
export interface CollisionMask {
  // If set to true, draws the outline of the mask
  //  Set this value to "false" before replacing any masks to clear the scene.
  showMask: boolean;

  isCollidingWith(other: CollisionMask): boolean;

  // Collision methods common to all collision masks
  intersectsBox(box: THREE.Box3): boolean;
  intersectsSphere(sphere: THREE.Sphere): boolean;
  intersectsRay(ray: THREE.Ray): THREE.Vector3 | null;

  // Other methods
  containsPoint(point: THREE.Vector3): boolean;
  update(object: THREE.Object3D): void;

  // Called internally by the game engine, ignore this method
  _drawMask(scene: THREE.Scene): void;
}

/**
 * Handles collisions for an axis-aligned bounding box
 */
export class BoxCollisionMask implements CollisionMask {
  // You can mutate this value
  public readonly box: THREE.Box3;

  // Set to true to draw the wireframe mask
  private _showMask = false;
  private helper: THREE.LineSegments | null = null;

  constructor(boxObject?: THREE.Box3 | THREE.Object3D) {
    this.box = new THREE.Box3();

    // Maybe update the box
    if (boxObject instanceof THREE.Box3) {
      this.box.copy(boxObject);
    } else if (boxObject instanceof THREE.Object3D) {
      this.update(boxObject);
    }
  }

  get showMask(): boolean {
    return this._showMask;
  }

  set showMask(newMask: boolean) {
    this._showMask = newMask;

    // Dispose of the Box3Helper
    //   Must manually remove the geometry or else we have a memory leak
    if (newMask === false && this.helper !== null) {
      this.helper.parent.remove(this.helper);
      this.helper = null;
    }
  }

  isCollidingWith(other: CollisionMask): boolean {
    return other.intersectsBox(this.box);
  }

  intersectsBox(box: THREE.Box3): boolean {
    return this.box.intersectsBox(box);
  }

  intersectsSphere(sphere: THREE.Sphere): boolean {
    return this.box.intersectsSphere(sphere);
  }

  intersectsRay(ray: THREE.Ray): THREE.Vector3 | null {
    return ray.intersectBox(this.box, new THREE.Vector3());
  }

  containsPoint(point: THREE.Vector3): boolean {
    return this.box.containsPoint(point);
  }

  update(object: THREE.Object3D): void {
    this.box.setFromObject(object);
  }

  /// Used internally by the game engine
  _drawMask(scene: THREE.Scene): void {
    if (this.showMask) {
      // Build a new box mesh for the scene
      if (this.helper === null) {
        this.helper = new THREE.LineSegments(BOX_GEOMETRY, WIREFRAME_MATERIAL);
        scene.add(this.helper);
      }

      // Resize box to fit the collision box
      this.box.getCenter(this.helper.position);
      this.box.getSize(this.helper.scale);
      this.helper.scale.multiplyScalar(0.5);
    } else {
      // Release the box resources
      if (this.helper !== null) {
        scene.remove(this.helper);
        this.helper = null;
      }
    }
  }
}

/**
 * Handles collision for a sphere
 */
export class SphereCollisionMask implements CollisionMask {
  // You can mutate this value
  public readonly sphere: THREE.Sphere;

  // Set to true to draw the wireframe mask
  private _showMask = false;
  private helper: THREE.LineSegments | null = null;

  constructor(sphereObject?: THREE.Sphere | THREE.Object3D) {
    this.sphere = new THREE.Sphere();

    if (sphereObject instanceof THREE.Sphere) {
      this.sphere.copy(sphereObject);
    } else if (sphereObject instanceof THREE.Mesh) {
      this.update(sphereObject);
    }
  }

  get showMask(): boolean {
    return this._showMask;
  }

  set showMask(newMask: boolean) {
    this._showMask = newMask;

    // Release the sphere resources
    if (newMask === false && this.helper !== null) {
      this.helper.parent.remove(this.helper);
      this.helper = null;
    }
  }

  isCollidingWith(other: CollisionMask): boolean {
    return other.intersectsSphere(this.sphere);
  }

  intersectsBox(box: THREE.Box3): boolean {
    return this.sphere.intersectsBox(box);
  }

  intersectsSphere(sphere: THREE.Sphere): boolean {
    return this.sphere.intersectsSphere(sphere);
  }

  intersectsRay(ray: THREE.Ray): THREE.Vector3 | null {
    return ray.intersectSphere(this.sphere, new THREE.Vector3());
  }

  containsPoint(point: THREE.Vector3): boolean {
    return this.sphere.containsPoint(point);
  }

  update(object: THREE.Object3D): void {
    this.sphere.set(object.position, 0);
    this.updateRecursive(object);
  }

  /**
   * Recursively expand the sphere for all geometries in the scene
   */
  private updateRecursive(object: THREE.Object3D): void {
    // First compute the current sphere
    const mesh = object as THREE.Mesh;
    if (mesh.geometry instanceof THREE.BufferGeometry) {
      mesh.geometry.computeBoundingSphere();

      const sphere = mesh.geometry.boundingSphere.clone();
      mesh.updateMatrix();
      sphere.applyMatrix4(mesh.matrix);
      this.sphere.union(sphere);
    }

    // Compute the sphere for all children
    for (const child of object.children) {
      this.updateRecursive(child);
    }
  }

  /// Used internally by the game engine
  _drawMask(scene: THREE.Scene): void {
    if (this.showMask) {
      // Build a new sphere mesh for the scene
      if (this.helper === null) {
        this.helper = new THREE.LineSegments(SPHERE_GEOMETRY, WIREFRAME_MATERIAL);
        scene.add(this.helper);
      }

      // Update the sphere position
      this.helper.position.copy(this.sphere.center);
      this.helper.scale.set(this.sphere.radius, this.sphere.radius, this.sphere.radius);
    } else {
      // Release the sphere resources
      if (this.helper !== null) {
        scene.remove(this.helper);
        this.helper = null;
      }
    }
  }
}

/**
 * Represents a collection of objects which form a mask.
 *
 * These methods all check against all masks in the collection.
 * Do NOT infinitely nest a collision mask, like a mask with itself in the list.
 */
export class GroupCollisionMask implements CollisionMask {
  public readonly masks: CollisionMask[];

  private _showMask = false;

  constructor(...masks: (CollisionMask | CollisionMask[])[]) {
    this.masks = [...masks.flat(1)];
  }

  get showMask(): boolean {
    return this._showMask;
  }

  /**
   * Automatically sets all of the masks of the children
   */
  set showMask(newMask: boolean) {
    this._showMask = newMask;
    for (const mask of this.masks) {
      mask.showMask = newMask;
    }
  }

  public addMask(...masks: (CollisionMask | CollisionMask[])[]): void {
    this.masks.push(...masks.flat(1));
  }

  isCollidingWith(other: CollisionMask): boolean {
    return this.masks.some((mask) => mask.isCollidingWith(other));
  }

  intersectsBox(box: THREE.Box3): boolean {
    return this.masks.some((mask) => mask.intersectsBox(box));
  }

  intersectsSphere(sphere: THREE.Sphere): boolean {
    return this.masks.some((mask) => mask.intersectsSphere(sphere));
  }

  intersectsRay(ray: THREE.Ray): THREE.Vector3 | null {
    // Find the closest intersection
    let min: THREE.Vector3 | null = null;
    for (const mask of this.masks) {
      const intersection = mask.intersectsRay(ray);
      if (intersection === null) {
        continue;
      }

      if (min === null || intersection.distanceTo(ray.origin) < min.distanceTo(ray.origin)) {
        min = intersection;
      }
    }

    return min;
  }

  containsPoint(point: THREE.Vector3): boolean {
    return this.masks.some((mask) => mask.containsPoint(point));
  }

  update(object: THREE.Object3D): void {
    for (const mask of this.masks) {
      mask.update(object);
    }
  }

  _drawMask(scene: THREE.Scene): void {
    if (this.showMask) {
      for (const mask of this.masks) {
        mask._drawMask(scene);
      }
    }
  }
}

/**
 * Collision mask that always returns false (No check)
 */
export class EmptyCollisionMask implements CollisionMask {
  showMask: boolean;

  isCollidingWith(_other: CollisionMask): boolean {
    return false;
  }

  intersectsBox(_box: THREE.Box3): boolean {
    return false;
  }

  intersectsSphere(_sphere: THREE.Sphere): boolean {
    return false;
  }

  intersectsRay(_ray: THREE.Ray): THREE.Vector3 | null {
    return null;
  }

  containsPoint(_point: THREE.Vector3): boolean {
    return false;
  }

  update(_object: THREE.Object3D): void {}

  _drawMask(_scene: THREE.Scene): void {}
}
