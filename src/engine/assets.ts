import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * All files needed to load a cube texture
 */
export interface CubeTextureFiles {
  positiveX: string;
  negativeX: string;
  positiveY: string;
  negativeY: string;
  positiveZ: string;
  negativeZ: string;
}

/**
 * Manage all assets in the game
 */
export class AssetsManager {
  private audioLoader: THREE.AudioLoader;
  private imageLoader: THREE.ImageLoader;
  private textureLoader: THREE.TextureLoader;
  private cubeTextureLoader: THREE.CubeTextureLoader;
  private objectLoader: THREE.ObjectLoader;
  private materialLoader: THREE.MaterialLoader;
  private animationLoader: THREE.AnimationLoader;
  private gltfLoader: GLTFLoader;

  private textures: Record<string, THREE.Texture> = {};
  private sounds: Record<string, AudioBuffer> = {};
  private images: Record<string, HTMLImageElement> = {};
  private objects: Record<string, THREE.Object3D> = {};
  private materials: Record<string, THREE.Material> = {};
  private animations: Record<string, THREE.AnimationClip> = {};

  /**
   * Constructed internally by the game entine
   */
  constructor() {
    this.audioLoader = new THREE.AudioLoader();
    this.imageLoader = new THREE.ImageLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.cubeTextureLoader = new THREE.CubeTextureLoader();
    this.objectLoader = new THREE.ObjectLoader();
    this.materialLoader = new THREE.MaterialLoader();
    this.animationLoader = new THREE.AnimationLoader();
    this.gltfLoader = new GLTFLoader();
  }

  /**
   * Load a texture from a file. The texture can be used immediately.
   * Replaces any existing loaded texture with the same name.
   * The texture namespace is shared with the cube texture namespace.
   *
   * Throws an exception if it fails to load (for whatever reason).
   *
   * @param name Name of the texture to store
   * @param file Filepath of the texture on the web server
   * @returns Promise to wait for asset to finish loading
   */
  public loadTexture(name: string, file: string): Promise<void> {
    return this.textureLoader
      .loadAsync(file, AssetsManager.onProgress('texture', name, file))
      .then((texture) => {
        this.textures[name] = texture;
      })
      .catch(AssetsManager.onError('texture', name, file));
  }

  /**
   * Load a cube texture from a file.
   * Replaces any existing loaded texture with the same name.
   * The cube texture namespace is shared with the texture namespace.
   *
   * Throws an exception if it fails to load (for whatever reason).
   *
   * @param name Name of the texture to store
   * @param files The six files required to load a cube texture
   * @returns Promise to wait for asset to finish loading
   */
  public loadCubeTexture(name: string, files: CubeTextureFiles): Promise<void> {
    return new Promise((resolve) => {
      const { positiveX, negativeX, positiveY, negativeY, positiveZ, negativeZ } = files;
      this.cubeTextureLoader.load(
        [positiveX, negativeX, positiveY, negativeY, positiveZ, negativeZ],
        (texture) => {
          this.textures[name] = texture;
          resolve();
        },

        AssetsManager.onProgress('cube texture', name, files.toString()),
        AssetsManager.onError('cube texture', name, files.toString()),
      );
    });
  }

  /**
   * Save a texture into the list of assets
   * Replaces any existing loaded texture with the same name.
   * The texture namespace is shared with the cube texture namespace.
   *
   * @param name Name of the texture to save
   * @param texture Texture to save
   */
  public saveTexture(name: string, texture: THREE.Texture): void {
    this.textures[name] = texture;
  }

  /**
   * Get a saved texture from the list of assets.
   * Throws an exception if the texture does not exist.
   *
   * Since Texture and CubeTexture share the same namespace, you might
   *  have to downcast if this is a cube texture.
   *
   * @param name Name of the texture to get
   * @returns The saved texture
   */
  public getTexture(name: string): THREE.Texture {
    const texture = this.textures[name];
    if (typeof texture === 'undefined') {
      throw new Error(`No such loaded texture '${name}'`);
    }

    return texture;
  }

  /**
   * Load sound from an audio file
   * Replaces any existing loaded audio with the same name.
   *
   * Throws an exception if it fails to load (for whatever reason).
   *
   * @param name Name of the audio to load
   * @param file Filepath of the audio file on the web server
   * @returns Promise to wait for asset to finish loading
   */
  public loadAudioFile(name: string, file: string): Promise<void> {
    return this.audioLoader
      .loadAsync(file, AssetsManager.onProgress('audio', name, file))
      .then((buffer: AudioBuffer) => {
        this.sounds[name] = buffer;
      })
      .catch(AssetsManager.onError('audio', name, file));
  }

  /**
   * Save a audio into the list of assets
   * Replaces any existing loaded audio with the same name.
   *
   * @param name Name of the audio to save
   * @param audio Audio to save
   */
  public saveAudio(name: string, audio: AudioBuffer): void {
    this.sounds[name] = audio;
  }

  /**
   * Get a saved audio buffer from the list of assets.
   * Throws an exception if the audio does not exist.
   *
   * @param name Name of the audio buffer to get
   * @returns The saved audio buffer
   */
  public getAudio(name: string): AudioBuffer {
    const audio = this.sounds[name];
    if (typeof audio === 'undefined') {
      throw new Error(`No such loaded audio buffer '${name}'`);
    }

    return audio;
  }

  /**
   * Load images from a file
   * Replaces any existing loaded image with the same name.
   *
   * Throws an exception if it fails to load (for whatever reason).
   *
   * @param name Name of the image to load
   * @param file Filepath of the image on the web server
   * @returns Promise to wait for asset to finish loading
   */
  public loadImage(name: string, file: string): Promise<void> {
    return this.imageLoader
      .loadAsync(file, AssetsManager.onProgress('image', name, file))
      .then((image: HTMLImageElement) => {
        this.images[name] = image;
      })
      .catch(AssetsManager.onError('audio', name, file));
  }

  /**
   * Save a image into the list of assets
   * Replaces any existing loaded image with the same name.
   *
   * @param name Name of the image to save
   * @param audio Image to save
   */
  public saveImage(name: string, image: HTMLImageElement): void {
    this.images[name] = image;
  }

  /**
   * Get a saved image from the list of assets.
   * Throws an exception if the image does not exist.
   *
   * @param name Name of the image to get
   * @returns The saved image
   */
  public getImage(name: string): HTMLImageElement {
    const image = this.images[name];
    if (typeof image === 'undefined') {
      throw new Error(`No such loaded image '${name}'`);
    }

    return image;
  }

  /**
   * Load an Object3D from a JSON file
   * Replaces any existing loaded Object3D with the same name.
   *
   * Throws an exception if it fails to load (for whatever reason).
   *
   * @param name Name of the object to load
   * @param file Filepath of the object to load
   * @returns Promise to wait for asset to finish loading
   */
  public loadObject(name: string, file: string): Promise<void> {
    return this.objectLoader
      .loadAsync(file, AssetsManager.onProgress('object', name, file))
      .then((object) => {
        this.objects[name] = object;
      })
      .catch(AssetsManager.onError('object', name, file));
  }

  /**
   * Save an Object3D into the list of assets
   * Replaces any existing loaded Object3D with the same name.
   *
   * @param name Name of the object to save
   * @param object Object3D to save
   */
  public saveObject(name: string, object: THREE.Object3D): void {
    this.objects[name] = object;
  }

  /**
   * Get a saved Object3D from the list of assets.
   * Throws an exception if the object does not exist.
   *
   * @param name Name of the object to get
   * @returns Object3D
   */
  public getObject(name: string): THREE.Object3D {
    const object = this.objects[name];
    if (typeof object === 'undefined') {
      throw new Error(`No such loaded object '${name}'`);
    }

    return object;
  }

  /**
   * Load a material from a JSON file
   * Replaces any existing loaded material with the same name.
   *
   * Throws an exception if it fails to load (for whatever reason).
   *
   * @param name Name of the material to load
   * @param file Filepath of the object to load
   * @returns Promise to wait for asset to finish loading
   */
  public loadMaterial(name: string, file: string): Promise<void> {
    return this.materialLoader
      .loadAsync(file, AssetsManager.onProgress('animation', name, file))
      .then((material) => {
        this.materials[name] = material;
      })
      .catch(AssetsManager.onError('animation', name, file));
  }

  /**
   * Save a material to the list of assets.
   * Replaces any existing loaded material with the same name.
   *
   * @param name Name of the material to save
   * @param material Material to save
   */
  public saveMaterial(name: string, material: THREE.Material): void {
    this.materials[name] = material;
  }

  /**
   * Get a saved material from the list of assets.
   * Throws an exception if the material does not exist.
   *
   * @param name Name of the material to get
   * @returns Material
   */
  public getMaterial(name: string): THREE.Material {
    const material = this.materials[name];
    if (typeof material === 'undefined') {
      throw new Error(`No such loaded material '${name}'`);
    }
    return material;
  }

  /**
   * Load a collection of animations from a JSON file.
   * Throws an exception if it fails to load (for whatever reason).
   *
   * Since one file can contain multiple animation clips, you must provide a custom callback
   * to individually name and store the animations.
   * The callback is also passed an instance of this asset manager.
   *
   * @param file JSON file to load
   * @param onLoad Callback to handle the loaded animation clips.
   * @returns Promise to wait for asset to finish loading
   */
  public loadAnimations(
    file: string,
    onLoad: (animation: THREE.AnimationClip[], manager: this) => void,
  ): Promise<void> {
    return this.animationLoader
      .loadAsync(file, AssetsManager.onProgress('animation', null, file))
      .then((animations) => onLoad(animations, this))
      .catch(AssetsManager.onError('animation', null, file));
  }

  /**
   * Save an animation to the list of assets.
   * Replaces any existing loaded animation with the same name.
   *
   * @param name Name of the animation to save
   * @param animation Animation to save
   */
  public saveAnimation(name: string, animation: THREE.AnimationClip): void {
    this.animations[name] = animation;
  }

  /**
   * Get a saved animation from the list of assets.
   * Throws an exception if the animation does not exist.
   *
   * @param name Name of the animation to get
   * @returns Animation
   */
  public getAnimation(name: string): THREE.AnimationClip {
    const animation = this.animations[name];
    if (typeof animation === 'undefined') {
      throw new Error(`No such loaded animation '${name}'`);
    }

    return animation;
  }

  /**
   * Load a GLTF file from a web server.
   *
   * You must provide a custom callback to decide how to handle the loaded object data.
   * The callback also includes a reference to the current AssetManager.
   * You can use the various save*() methods to save the included assets
   *
   * Throws an exception if it fails to load (for whatever reason).
   *
   * @param file File to load
   * @param onLoad Callback that dictates how to handle the loaded data.
   * @returns Promise to wait for asset to finish loading
   */
  public loadGLTFFile(file: string, onLoad: (gltf: GLTF, manager: this) => void): Promise<void> {
    return this.gltfLoader
      .loadAsync(file, AssetsManager.onProgress('gltf', null, file))
      .then((gltf) => onLoad(gltf, this))
      .catch(AssetsManager.onError('gltf', null, file));
  }

  /**
   * Display a progress log message as files are downloaded
   */
  private static onProgress(
    filetype: string,
    name: string | null,
    file: string,
  ): (event: ProgressEvent<EventTarget>) => void {
    const nameString = name !== null ? `'${name}' ` : '';
    return (event) => {
      console.log(
        `Loading ${filetype} ${nameString}from '${file}': ${((event.loaded * 100) / event.total).toFixed(0)}%`,
      );
    };
  }

  /**
   * Throw an exception if an error occurs
   */
  private static onError(filetype: string, name: string | null, file: string): (error: ErrorEvent) => void {
    const nameString = name !== null ? `'${name}' ` : '';
    return (error) => {
      throw new Error(`Error loading ${filetype} ${nameString}from '${file}': ${error.message}`);
    };
  }
}
