import { MainArea } from 'areas/MainArea';
import { MazeObject } from 'areas/MazeObject';
import { Entity, EntityState } from 'engine/entity';
import { clamp } from 'engine/helpers';
import { Key } from 'engine/input';
import { Health } from 'resources/Health';
import { Inventory } from 'resources/Inventory';
import { DoorColor } from './DoorColor';
import { DoorState } from 'resources/DoorState';
import { ElectricBoxType } from './ElectricBoxType';
import * as THREE from 'three';

// Map drawing flags
const TILE_SIZE_PX = 16;
const MARGIN_PX = 4;
const MAP_TILES_VISIBLE = 9; /* 9x9 Square Tiles */
const MAP_TILES_VISIT = 3; /* Player uncovers nxn tiles */

// Anchors for the display
const HUD_LEFT = 10;
const HUD_TOP = 10;
const HUD_RIGHT = 10;
const HUD_BOTTOM = 20;
const MAP_MARGIN = 15;

// Colors
const GRASS_COLOR = '#a0d914';
const OUTSIDE_COLOR = '#a0a914';
const WALL_COLOR = '#6b6764';
const UNVISITED_COLOR = '#3b3b3b';
const DRONE_COLOR = 'lightgrey';

// Lookup table for map objects
type DrawFunction = (
  g2d: CanvasRenderingContext2D,
  x: number,
  y: number,
  row: number,
  col: number,
  entity: Entity<HUD>,
) => void;

const MAP_DRAW_FUNCTIONS: { [K in MazeObject]?: DrawFunction } = {
  [MazeObject.Wall]: mapDrawWall,
  [MazeObject.Energy]: mapDrawIcon('Energy'),
  [MazeObject.RedDoor]: mapDrawDoor('red', checkColoredDoor),
  [MazeObject.YellowDoor]: mapDrawDoor('yellow', checkColoredDoor),
  [MazeObject.GreenDoor]: mapDrawDoor('green', checkColoredDoor),
  [MazeObject.BlueDoor]: mapDrawDoor('blue', checkColoredDoor),
  [MazeObject.RedKey]: mapDrawIcon('RedKey'),
  [MazeObject.YellowKey]: mapDrawIcon('YellowKey'),
  [MazeObject.GreenKey]: mapDrawIcon('GreenKey'),
  [MazeObject.BlueKey]: mapDrawIcon('BlueKey'),
  [MazeObject.Battery]: mapDrawIcon('Battery'),
  [MazeObject.Lever]: mapDrawLeverIcon(),
  [MazeObject.ToggleDoor]: mapDrawDoor('orange', checkToggleDoor()),
  [MazeObject.InverseToggleDoor]: mapDrawDoor('orange', checkToggleDoor(true)),
  [MazeObject.ADoor]: mapDrawDoor('grey', checkElectricDoor(ElectricBoxType.A)),
  [MazeObject.BDoor]: mapDrawDoor('grey', checkElectricDoor(ElectricBoxType.B)),
  [MazeObject.CDoor]: mapDrawDoor('grey', checkElectricDoor(ElectricBoxType.C)),
  [MazeObject.ABox]: mapDrawIcon('ElectricBox'),
  [MazeObject.BBox]: mapDrawIcon('ElectricBox'),
  [MazeObject.CBox]: mapDrawIcon('ElectricBox'),
  [MazeObject.BigDoor]: mapDrawDoor('#654321', checkBigDoor),
  [MazeObject.Portal]: mapDrawPortal(),
};

const KEY_COLOR_ICON: Record<DoorColor, string> = {
  [DoorColor.Red]: 'RedKey',
  [DoorColor.Yellow]: 'YellowKey',
  [DoorColor.Green]: 'GreenKey',
  [DoorColor.Blue]: 'BlueKey',
};

/**
 * Draw the heads-up display
 */
export class HUD implements EntityState {
  public readonly tags: string[] = ['hud'];

  private entity: Entity<this>;

  /// Canvas for the map
  private mapCanvas: HTMLCanvasElement;
  private mapVisited: boolean[][];
  private shouldDrawMap = false;

  // Message to show during a frame
  public message = '';

  constructor() {
    this.mapCanvas = document.createElement('canvas');
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;

    const mainArea = entity.area.state as MainArea;
    this.mapVisited = Array(mainArea.mazeHeight)
      .fill(null)
      .map(() =>
        Array(mainArea.mazeWidth)
          .fill(null)
          .map(() => true),
      );

    // Only draw map every few frames, as this is an expensive operation
    this.entity.setTimer(0, 24, true);
    this.redrawMap();
  }

  onDestroy(): void {}

  onStep(): void {
    this.updateVisited();
    this.shouldDrawMap = this.entity.area.game.input.isKeyDown(Key.M);
  }

  /**
   * Update the visited tiles
   */
  private updateVisited(): void {
    const mainArea = this.entity.area.state as MainArea;
    const [playerTileRow, playerTileCol] = mainArea.getPlayerTileLocation();

    for (let row = -MAP_TILES_VISIT; row <= MAP_TILES_VISIT; row += 1) {
      for (let col = -MAP_TILES_VISIT; col <= MAP_TILES_VISIT; col += 1) {
        this.mapVisited[clamp(playerTileRow + row, 0, mainArea.mazeHeight - 1)][
          clamp(playerTileCol + col, 0, mainArea.mazeWidth - 1)
        ] = true;
      }
    }
  }

  /**
   * Dynamically redraw the map every frame
   */
  private redrawMap(): void {
    const mainArea = this.entity.area.state as MainArea;
    const g2d = this.mapCanvas.getContext('2d');

    const imageWidth = mainArea.mazeWidth * TILE_SIZE_PX + 2 * MARGIN_PX;
    const imageHeight = mainArea.mazeHeight * TILE_SIZE_PX + 2 * MARGIN_PX;
    this.mapCanvas.width = imageWidth;
    this.mapCanvas.height = imageHeight;

    // Clear the map
    g2d.fillStyle = GRASS_COLOR;
    g2d.fillRect(0, 0, imageWidth, imageHeight);

    // Draw the individual grid cells
    for (let row = 0; row < mainArea.mazeHeight; row += 1) {
      for (let col = 0; col < mainArea.mazeWidth; col += 1) {
        const x = MARGIN_PX + col * TILE_SIZE_PX;
        const y = MARGIN_PX + row * TILE_SIZE_PX;

        if (!this.mapVisited[row][col]) {
          g2d.fillStyle = UNVISITED_COLOR;
          g2d.fillRect(x, y, TILE_SIZE_PX, TILE_SIZE_PX);
          continue;
        }

        const drawFunc = MAP_DRAW_FUNCTIONS[mainArea.maze[row][col]];
        if (typeof drawFunc !== 'undefined') {
          drawFunc(g2d, x, y, row, col, this.entity);
        }
      }
    }

    // Draw any drones in the maze
    for (const drone of this.entity.area.findEntities('drone')) {
      const [row, col] = mainArea.positionToTileLocation(drone.object.position);

      // Make sure the player can actually see the tile
      if (!this.mapVisited[row][col]) {
        continue;
      }

      const x = MARGIN_PX + col * TILE_SIZE_PX;
      const y = MARGIN_PX + row * TILE_SIZE_PX;

      g2d.fillStyle = DRONE_COLOR;
      g2d.beginPath();
      g2d.arc(x + TILE_SIZE_PX / 2, y + TILE_SIZE_PX / 2, TILE_SIZE_PX / 3, 0, 2 * Math.PI);
      g2d.fill();
      g2d.strokeStyle = 'black';
      g2d.lineWidth = 1;
      g2d.stroke();
    }
  }

  onTimer(timerIndex: number): void {
    if (timerIndex === 0) {
      this.redrawMap();
    }
  }

  onDraw(g2d: CanvasRenderingContext2D): void {
    if (this.shouldDrawMap) {
      this.drawFullMap(g2d);
    } else {
      this.drawHUD(g2d);
    }

    // Clear any messages every frame
    this.message = '';
  }

  /**
   * Draw the main heads-up display
   */
  private drawHUD(g2d: CanvasRenderingContext2D) {
    this.drawHealthBar(g2d);
    this.drawMapSubset(g2d);
    this.drawInventory(g2d);
    this.drawMessage(g2d);
    this.drawTarget(g2d);
  }

  /**
   * Draw the player health bar in the top left corner
   */
  private drawHealthBar(g2d: CanvasRenderingContext2D): void {
    // Draw "Health" Text
    g2d.textAlign = 'left';
    g2d.textBaseline = 'top';
    g2d.font = '30px sans-serif';
    g2d.fillStyle = '#ffffff';
    g2d.fillText('Health:', HUD_LEFT, HUD_TOP);

    // Draw the "health bar"
    const health = this.entity.area.game.resources.getResource<Health>('health');
    drawHealthBar(
      g2d,
      health.getHealthPercentLeft(),
      HUD_LEFT + g2d.measureText('Health:').width + 10,
      HUD_TOP,
      100, // Width
      25, // Height
      new THREE.Color(0, 1, 0),
      new THREE.Color(1, 0, 0),
    );
  }

  /**
   * Draw the minimap on the HUD
   */
  private drawMapSubset(g2d: CanvasRenderingContext2D): void {
    const mainArea = this.entity.area.state as MainArea;

    const [playerTileRow, playerTileCol] = mainArea.getPlayerTileLocation();
    const leftTileX = playerTileCol - Math.floor(MAP_TILES_VISIBLE / 2);
    const topTileY = playerTileRow - Math.floor(MAP_TILES_VISIBLE / 2);
    const leftX = leftTileX * TILE_SIZE_PX;
    const topY = topTileY * TILE_SIZE_PX;
    const imageSize = TILE_SIZE_PX * MAP_TILES_VISIBLE + 2 * MARGIN_PX;
    const leftValueX = this.entity.area.overlayWidth - (HUD_RIGHT + imageSize);

    // Fill with the default color
    g2d.fillStyle = OUTSIDE_COLOR;
    g2d.fillRect(leftValueX, HUD_TOP, imageSize, imageSize);

    // Draw the map subset
    g2d.drawImage(this.mapCanvas, leftX, topY, imageSize, imageSize, leftValueX, HUD_TOP, imageSize, imageSize);

    // Add a border
    g2d.beginPath();
    g2d.rect(leftValueX, HUD_TOP, imageSize, imageSize);
    g2d.strokeStyle = 'brown';
    g2d.lineWidth = 4;
    g2d.stroke();

    // // Draw the compass letters (N,S,E,W)
    const compassMargin = 15;
    g2d.fillStyle = 'red';
    g2d.font = '10pt sans-serif';
    g2d.textAlign = 'center';
    g2d.textBaseline = 'middle';
    g2d.fillText('N', leftValueX + imageSize / 2, HUD_TOP + compassMargin);
    g2d.fillStyle = 'white';
    g2d.fillText('S', leftValueX + imageSize / 2, HUD_TOP + imageSize - compassMargin);
    g2d.fillText('W', leftValueX + compassMargin, HUD_TOP + imageSize / 2);
    g2d.fillText('E', leftValueX + imageSize - compassMargin, HUD_TOP + imageSize / 2);

    // Draw an arrow to represent the player
    g2d.strokeStyle = 'red';
    g2d.lineWidth = 2.0;
    drawArrow(g2d, leftValueX + imageSize / 2, HUD_TOP + imageSize / 2, mainArea.getPlayerAngle(), TILE_SIZE_PX);
  }

  /**
   * Draw the collected inventory items
   */
  private drawInventory(g2d: CanvasRenderingContext2D): void {
    const mainArea = this.entity.area.state as MainArea;
    const inventory = this.entity.area.game.resources.getResource<Inventory>('inventory');
    const assets = this.entity.area.game.assets;

    const slotSize = 32;
    const spacing = slotSize / 4;

    // Always draw the energy left
    g2d.drawImage(assets.getImage('Energy'), HUD_LEFT, HUD_TOP + 30, slotSize, slotSize);
    g2d.font = '10pt sans-serif';
    g2d.fillStyle = 'white';
    g2d.textAlign = 'center';
    g2d.textBaseline = 'top';
    g2d.fillText(
      `${mainArea.totalEnergy - mainArea.energyLeft} / ${mainArea.totalEnergy}`,
      HUD_LEFT + slotSize / 2,
      HUD_TOP + 30 + slotSize,
    );

    let currentX = HUD_LEFT + slotSize + spacing;

    // Do all of the keys
    for (const keyColor of [DoorColor.Red, DoorColor.Yellow, DoorColor.Green, DoorColor.Blue]) {
      if (!inventory.hasKeyAvailable(keyColor)) {
        continue;
      }

      const icon = assets.getImage(KEY_COLOR_ICON[keyColor]);
      g2d.drawImage(icon, currentX, HUD_TOP + 30, slotSize, slotSize);
      g2d.fillText(`x${inventory.getKeyCount(keyColor)}`, currentX + slotSize / 2, HUD_TOP + 30 + slotSize);
      currentX += slotSize + spacing;
    }

    // Also do the battery
    if (inventory.hasCollectedBattery()) {
      const icon = assets.getImage('Battery');
      g2d.drawImage(icon, currentX, HUD_TOP + 30, slotSize, slotSize);
      g2d.fillText('x1', currentX + slotSize / 2, HUD_TOP + 30 + slotSize);
      currentX += slotSize + spacing;
    }
  }

  /**
   * Draw the message along the bottom of the screen
   */
  private drawMessage(g2d: CanvasRenderingContext2D): void {
    if (this.message.length <= 0) {
      return;
    }

    g2d.font = '24pt sans-serif';
    g2d.textAlign = 'center';
    g2d.textBaseline = 'bottom';

    const metrics = g2d.measureText(this.message);
    const margin = 10;
    const width = metrics.width + margin;
    const height = metrics.actualBoundingBoxAscent - metrics.fontBoundingBoxDescent + margin;

    const centerX = this.entity.area.overlayWidth / 2;
    const centerY = this.entity.area.overlayHeight - HUD_BOTTOM;

    g2d.fillStyle = 'black';
    g2d.fillRect(centerX - width / 2, centerY - height, width, height);

    g2d.lineWidth = 2;
    g2d.strokeStyle = 'orange';
    g2d.beginPath();
    g2d.rect(centerX - width / 2, centerY - height, width, height);
    g2d.stroke();

    g2d.fillStyle = 'white';
    g2d.fillText(this.message, centerX, centerY);
  }

  /**
   * Draw a dot in the center for the gun target
   */
  private drawTarget(g2d: CanvasRenderingContext2D): void {
    const centerX = this.entity.area.overlayWidth / 2;
    const centerY = this.entity.area.overlayHeight / 2;
    const length = 5;

    g2d.lineWidth = 1;
    g2d.strokeStyle = 'white';

    g2d.beginPath();
    g2d.moveTo(centerX - length, centerY);
    g2d.lineTo(centerX + length, centerY);
    g2d.moveTo(centerX, centerY - length);
    g2d.lineTo(centerX, centerY + length);
    g2d.stroke();
  }

  /**
   * Draw the fullscreen map centered
   */
  private drawFullMap(g2d: CanvasRenderingContext2D): void {
    const mainArea = this.entity.area.state as MainArea;
    const [playerTileRow, playerTileCol] = mainArea.getPlayerTileLocation();

    const maxWidth = this.entity.area.overlayWidth - MAP_MARGIN * 2;
    const maxHeight = this.entity.area.overlayHeight - MAP_MARGIN * 2;
    const imgWidth = Math.min(maxWidth, this.mapCanvas.width);
    const imgHeight = Math.min(maxHeight, this.mapCanvas.height);

    const leftImgX = playerTileCol * TILE_SIZE_PX + TILE_SIZE_PX / 2 + MARGIN_PX;
    const leftImgY = playerTileRow * TILE_SIZE_PX + TILE_SIZE_PX / 2 + MARGIN_PX;
    const centerX = this.entity.area.overlayWidth / 2;
    const centerY = this.entity.area.overlayHeight / 2;
    const leftX = centerX - imgWidth / 2;
    const topY = centerY - imgHeight / 2;

    // Fill with a default color
    g2d.fillStyle = OUTSIDE_COLOR;
    g2d.fillRect(leftX, topY, imgWidth, imgHeight);

    // Draw the image subset
    g2d.drawImage(
      this.mapCanvas,
      leftImgX - imgWidth / 2,
      leftImgY - imgHeight / 2,
      imgWidth,
      imgHeight,
      leftX,
      topY,
      imgWidth,
      imgHeight,
    );

    // Add a border
    g2d.beginPath();
    g2d.rect(leftX, topY, imgWidth, imgHeight);
    g2d.strokeStyle = 'brown';
    g2d.lineWidth = 4;
    g2d.stroke();

    // // Draw the compass letters (N,S,E,W)
    const compassMargin = 25;
    g2d.fillStyle = 'red';
    g2d.font = '24pt sans-serif';
    g2d.textAlign = 'center';
    g2d.textBaseline = 'middle';
    g2d.fillText('N', leftX + imgWidth / 2, topY + compassMargin);
    g2d.fillStyle = 'white';
    g2d.fillText('S', leftX + imgWidth / 2, topY + imgHeight - compassMargin);
    g2d.fillText('W', leftX + compassMargin, topY + imgHeight / 2);
    g2d.fillText('E', leftX + imgWidth - compassMargin, topY + imgHeight / 2);

    // Draw an arrow to represent the player
    g2d.strokeStyle = 'red';
    g2d.lineWidth = 2.0;
    drawArrow(g2d, leftX + imgWidth / 2, topY + imgHeight / 2, mainArea.getPlayerAngle(), TILE_SIZE_PX);
  }
}

/**
 * Draw a health bar to the scene
 */
function drawHealthBar(
  g2d: CanvasRenderingContext2D,
  health: number,
  x: number,
  y: number,
  width: number,
  height: number,
  fullHealth: THREE.Color,
  noHealth: THREE.Color,
) {
  health = clamp(health, 0, 1);

  const color = new THREE.Color();
  color.lerpColors(noHealth, fullHealth, health);

  // Inside bar
  g2d.fillStyle = '#' + color.getHexString();
  g2d.fillRect(x, y, width * health, height);

  // Outline
  g2d.beginPath();
  g2d.strokeStyle = 'black';
  g2d.rect(x, y, width, height);
  g2d.stroke();
}

/**
 * Draw an arrow, centered at (x,y), with a given direction and magnitude
 */
function drawArrow(g2d: CanvasRenderingContext2D, centerX: number, centerY: number, angle: number, r: number) {
  const headX = centerX + (r / 2) * Math.cos(angle);
  const headY = centerY - (r / 2) * Math.sin(angle);
  const tailX = centerX - (r / 2) * Math.cos(angle);
  const tailY = centerY + (r / 2) * Math.sin(angle);

  const headLen = 6;
  const headAngle = Math.PI / 6;

  g2d.beginPath();
  g2d.moveTo(tailX, tailY);
  g2d.lineTo(headX, headY);
  g2d.lineTo(headX - headLen * Math.cos(angle - headAngle), headY + headLen * Math.sin(angle - headAngle));
  g2d.moveTo(headX, headY);
  g2d.lineTo(headX - headLen * Math.cos(angle + headAngle), headY + headLen * Math.sin(angle + headAngle));
  g2d.stroke();
}

/**
 * Map drawing functions
 */
function mapDrawWall(g2d: CanvasRenderingContext2D, x: number, y: number): void {
  g2d.fillStyle = WALL_COLOR;
  g2d.fillRect(x, y, TILE_SIZE_PX, TILE_SIZE_PX);
}

function mapDrawIcon(name: string): DrawFunction {
  return (g2d, x, y, _row, _col, entity) => {
    const iconImage = entity.area.game.assets.getImage(name);
    g2d.drawImage(iconImage, x, y, TILE_SIZE_PX, TILE_SIZE_PX);
  };
}

function mapDrawClosedDoor(color: string): DrawFunction {
  return (g2d, x, y, row) => {
    g2d.fillStyle = color;

    if (row % 2 === 1) {
      g2d.fillRect(x + TILE_SIZE_PX / 4, y, TILE_SIZE_PX / 2, TILE_SIZE_PX);
    } else {
      g2d.fillRect(x, y + TILE_SIZE_PX / 4, TILE_SIZE_PX, TILE_SIZE_PX / 2);
    }
  };
}

function mapDrawOpenedDoor(color: string): DrawFunction {
  return (g2d, x, y, row) => {
    g2d.fillStyle = color;

    const margin = 2;
    if (row % 2 === 1) {
      g2d.fillRect(x + TILE_SIZE_PX / 4, y, TILE_SIZE_PX / 2, margin);
      g2d.fillRect(x + TILE_SIZE_PX / 4, y + TILE_SIZE_PX - margin, TILE_SIZE_PX / 2, margin);
    } else {
      g2d.fillRect(x, y + TILE_SIZE_PX / 4, margin, TILE_SIZE_PX / 2);
      g2d.fillRect(x + TILE_SIZE_PX - margin, y + TILE_SIZE_PX / 4, margin, TILE_SIZE_PX / 2);
    }
  };
}

type ToggleFunction = (entity: Entity<HUD>, row: number, col: number) => boolean;

function mapDrawDoor(color: string, isOpen: ToggleFunction): DrawFunction {
  return (g2d, x, y, row, col, entity) => {
    if (isOpen(entity, row, col)) {
      mapDrawOpenedDoor(color)(g2d, x, y, row, col, entity);
    } else {
      mapDrawClosedDoor(color)(g2d, x, y, row, col, entity);
    }
  };
}

function checkBigDoor(entity: Entity<HUD>): boolean {
  const state = entity.area.game.resources.getResource<DoorState>('door-state');
  return state.isBigDoorOpened();
}

function checkColoredDoor(entity: Entity<HUD>, row: number, col: number): boolean {
  const state = entity.area.game.resources.getResource<DoorState>('door-state');
  return state.isColoredDoorOpened(row, col);
}

function checkToggleDoor(reverse = false): ToggleFunction {
  return (entity) => {
    const state = entity.area.game.resources.getResource<DoorState>('door-state');
    return state.getToggleState() !== reverse;
  };
}

function checkElectricDoor(type: ElectricBoxType): ToggleFunction {
  return (entity) => {
    const state = entity.area.game.resources.getResource<DoorState>('door-state');
    return state.isDoorPowered(type);
  };
}

function mapDrawLeverIcon(): DrawFunction {
  return (g2d, x, y, row, col, entity) => {
    const state = entity.area.game.resources.getResource<DoorState>('door-state');
    const icon = state.getToggleState() ? 'LeverReverse' : 'Lever';
    mapDrawIcon(icon)(g2d, x, y, row, col, entity);
  };
}

function mapDrawPortal(): DrawFunction {
  return (g2d, x, y, _row, _col, entity) => {
    const mainArea = entity.area.state as MainArea;
    if (mainArea.energyLeft === 0) {
      g2d.fillStyle = '#5B00E7';
    } else {
      g2d.fillStyle = '#511f1f';
    }

    g2d.fillRect(x - (2 * TILE_SIZE_PX) / 3, y + TILE_SIZE_PX / 4, (7 * TILE_SIZE_PX) / 3, TILE_SIZE_PX / 2);

    const iconImage = entity.area.game.assets.getImage('Energy');
    g2d.drawImage(iconImage, x + TILE_SIZE_PX / 4, y + TILE_SIZE_PX / 4, TILE_SIZE_PX / 2, TILE_SIZE_PX / 2);
  };
}
