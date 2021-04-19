import { MainArea } from 'areas/MainArea';
import { MazeObject } from 'areas/MazeObject';
import { Entity, EntityState } from 'engine/entity';
import { clamp } from 'engine/helpers';
import { Key } from 'engine/input';
import { Health } from 'resources/Health';
import { Inventory } from 'resources/Inventory';
import { DoorColor } from './DoorColor';
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
  [MazeObject.RedKey]: mapDrawIcon('RedKey'),
  [MazeObject.YellowKey]: mapDrawIcon('YellowKey'),
  [MazeObject.GreenKey]: mapDrawIcon('GreenKey'),
  [MazeObject.BlueKey]: mapDrawIcon('BlueKey'),
  [MazeObject.RedDoor]: mapDrawDoor('red'),
  [MazeObject.YellowDoor]: mapDrawDoor('yellow'),
  [MazeObject.GreenDoor]: mapDrawDoor('green'),
  [MazeObject.BlueDoor]: mapDrawDoor('blue'),
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
  public readonly tags: string[] = ['overlay'];

  private entity: Entity<this>;

  /// Canvas for the map
  private mapCanvas: HTMLCanvasElement;
  private mapVisited: boolean[][];
  private shouldDrawMap = false;

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
          .map(() => false),
      );
  }

  onDestroy(): void {}

  onStep(): void {
    this.updateVisited();
    this.redrawMap();
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

    // Also draw an arrow to represent the player
    const [playerTileRow, playerTileCol] = mainArea.getPlayerTileLocation();
    const playerX = MARGIN_PX + playerTileCol * TILE_SIZE_PX + TILE_SIZE_PX / 2;
    const playerY = MARGIN_PX + playerTileRow * TILE_SIZE_PX + TILE_SIZE_PX / 2;
    g2d.strokeStyle = 'red';
    g2d.lineWidth = 2.0;
    drawArrow(g2d, playerX, playerY, mainArea.getPlayerAngle(), TILE_SIZE_PX);
  }

  onTimer(_timerIndex: number): void {}

  onDraw(g2d: CanvasRenderingContext2D): void {
    if (this.shouldDrawMap) {
      this.drawFullMap(g2d);
    } else {
      this.drawHUD(g2d);
    }
  }

  /**
   * Draw the main heads-up display
   */
  private drawHUD(g2d: CanvasRenderingContext2D) {
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

    // Draw the minimap
    this.drawMapSubset(g2d);

    // And inventory
    this.drawInventory(g2d);

    // Finally, draw a small plus at the center of the screen
    this.drawTarget(g2d);
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

    const leftImgX = playerTileCol * TILE_SIZE_PX;
    const leftImgY = playerTileRow * TILE_SIZE_PX;
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

function mapDrawDoor(color: string): DrawFunction {
  return (g2d, x, y, row) => {
    g2d.fillStyle = color;

    if (row % 2 === 1) {
      g2d.fillRect(x + TILE_SIZE_PX / 4, y, TILE_SIZE_PX / 2, TILE_SIZE_PX);
    } else {
      g2d.fillRect(x, y + TILE_SIZE_PX / 4, TILE_SIZE_PX, TILE_SIZE_PX / 2);
    }
  };
}
