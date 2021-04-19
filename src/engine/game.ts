import * as THREE from 'three';
import { Area, AreaState } from 'engine/area';
import { InputManager } from './input';
import { AssetsManager } from './assets';
import { ResourceManager } from './storage';

/**
 * Represents the main interface for interacting with the game
 */
export class Game {
  /* Handle input events */
  public readonly input: InputManager;

  /* Handle game assets */
  public readonly assets: AssetsManager;

  /* Global variables */
  public readonly resources: ResourceManager;

  /* Possibly specify a fixed size for the render output */
  public screenSize: [number, number] | null = null;

  /* Every game must store an activate area */
  private _currentArea: Area;
  private nextArea: AreaState | null = null;

  /* Objects required for drawing */
  public readonly renderer: THREE.WebGLRenderer;
  private readonly canvas: HTMLCanvasElement;
  private readonly overlayCanvas: HTMLCanvasElement;

  private running = false;

  /**
   * Create a new game object.
   *
   * The game expects the overlay canvas to be directly on top of the game canvas.
   * Thus, user input is actually handled by the overlay canvas, NOT the game canvas.
   *
   * @param gameCanvas Canvas to use for drawing the game
   * @param overlayCanvas Canvas to use for the overlay drawing
   * @param area
   */
  public constructor(gameCanvas: HTMLCanvasElement, overlayCanvas: HTMLCanvasElement) {
    this.input = new InputManager(overlayCanvas);
    this.assets = new AssetsManager();
    this.resources = new ResourceManager();

    this.renderer = new THREE.WebGLRenderer({ canvas: gameCanvas });
    this.canvas = gameCanvas;
    this.overlayCanvas = overlayCanvas;
  }

  /**
   * Start running the game engine
   */
  public start(area: AreaState): void {
    if (this.running === false) {
      this.running = true;

      this._currentArea = new Area(this, area);
      this._currentArea.state.onCreate(this._currentArea);
      this.overlayCanvas.focus();

      requestAnimationFrame(this.tick.bind(this));
    }
  }

  /**
   * Stop running the game engine
   */
  public stop(): void {
    this.running = false;
  }

  /**
   * Get the current area in the game
   */
  public get currentArea(): Area {
    return this._currentArea;
  }

  /**
   * Set the next area to display for the game engine
   *
   * @param nextArea Next area to display
   */
  public setArea(nextArea: AreaState): void {
    if (this.nextArea === null) {
      this.nextArea = nextArea;
    }
  }

  /**
   * Get the absolute width of the canvas in the browser
   */
  public get canvasWidth(): number {
    return this.canvas.width;
  }

  /**
   * Get the absolute height of the canvas in the browser
   */
  public get canvasHeight(): number {
    return this.canvas.height;
  }

  /**
   * Get the absolute width of the overlay canvas in the browser
   */
  public get overlayWidth(): number {
    return this.overlayCanvas.width;
  }

  /**
   * Get the absolute height of the overlay canvas in the browser
   */
  public get overlayHeight(): number {
    return this.overlayCanvas.height;
  }

  /**
   * Run a single game tick in the engine
   */
  private tick(): void {
    this.resizeCanvas();

    // Build the next area
    if (this.nextArea !== null) {
      this._currentArea = new Area(this, this.nextArea);
      this.nextArea = null;
      this.currentArea.state.onCreate(this.currentArea);
    }

    // Area actions
    this.currentArea._tickTimers();
    this.currentArea.state.onStep();

    // Entity actions
    this.currentArea._createEntities();
    this.currentArea._destroyEntities();
    this.currentArea._tickEntityTimers();
    this.currentArea._stepEntities();

    // Draw scene
    this.currentArea._drawScene(this.renderer, this.overlayCanvas);

    // Update input
    this.input._clearKeyTick();
    this.input._updateGamepad();
    this.input._clearMouseTick();

    // Keep running?
    if (this.running === true) {
      requestAnimationFrame(this.tick.bind(this));
    }
  }

  /**
   * Automatically resize the canvas and the renderer to match the correct size
   */
  private resizeCanvas(): void {
    const [displayWidth, displayHeight] =
      this.screenSize === null ? [this.canvas.clientWidth, this.canvas.clientHeight] : this.screenSize;

    // No need to update
    if (this.canvas.width === displayWidth && this.canvas.height === displayHeight) {
      return;
    }

    this.canvas.width = displayWidth;
    this.canvas.height = displayHeight;
    this.renderer.setSize(displayWidth, displayHeight, false);
  }
}
