import { MainArea } from 'areas/MainArea';
import { MazeObject } from 'areas/MazeObject';
import { Entity, EntityState } from 'engine/entity';
import { clamp, pickClosest } from 'engine/helpers';
import * as THREE from 'three';

// Map drawing flags
const TILE_SIZE_PX = 16;
const MARGIN_PX = 4;
const MAP_TILES_VISIBLE = 9; /* 7x7 Square Tiles */

const GRASS_COLOR = '#a0d914';
const WALL_COLOR = '#6b6764';

/**
 * Draw the heads-up display
 */
export class HUD implements EntityState {
  public readonly tags: string[] = ['overlay'];

  private entity: Entity<this>;

  /// Canvas for the map
  private mapCanvas: HTMLCanvasElement;

  constructor() {
    this.mapCanvas = document.createElement('canvas');
  }

  onCreate(entity: Entity<this>): void {
    this.entity = entity;
  }

  onDestroy(): void {}

  onStep(): void {
    this.redrawMap();
  }

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
    g2d.fillStyle = WALL_COLOR;
    for (let row = 0; row < mainArea.mazeHeight; row += 1) {
      for (let col = 0; col < mainArea.mazeWidth; col += 1) {
        const mazeObject = mainArea.maze[row][col];
        if (mazeObject === MazeObject.Wall) {
          const x = MARGIN_PX + col * TILE_SIZE_PX;
          const y = MARGIN_PX + row * TILE_SIZE_PX;

          g2d.fillRect(x, y, TILE_SIZE_PX, TILE_SIZE_PX);
        }
      }
    }
  }

  onTimer(timerIndex: number): void {}

  onDraw(g2d: CanvasRenderingContext2D): void {
    // Draw "Health" Text
    g2d.textAlign = 'left';
    g2d.textBaseline = 'top';
    g2d.font = '30px sans-serif';
    g2d.fillStyle = '#ffffff';
    g2d.fillText('Health:', 10, 10);

    drawHealthBar(g2d, 0.75, 120, 10, 100, 25, new THREE.Color(0, 1, 0), new THREE.Color(1, 0, 0));

    this.drawMapSubset(g2d);
  }

  private drawMapSubset(g2d: CanvasRenderingContext2D): void {
    const mainArea = this.entity.area.state as MainArea;
    const [playerTileRow, playerTileCol] = mainArea.getPlayerTileLocation();
    const upAngle =
      pickClosest(mainArea.getPlayerAngle(), [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, 2 * Math.PI]) - Math.PI / 2;

    const leftTileX = playerTileCol - Math.floor(MAP_TILES_VISIBLE / 2);
    const topTileY = playerTileRow - Math.floor(MAP_TILES_VISIBLE / 2);
    const leftX = leftTileX * TILE_SIZE_PX;
    const topY = topTileY * TILE_SIZE_PX;
    const imageSize = TILE_SIZE_PX * MAP_TILES_VISIBLE + 2 * MARGIN_PX;
    const leftValueX = this.entity.area.overlayWidth - (10 + imageSize);

    // Fill with the grass color
    g2d.fillStyle = GRASS_COLOR;
    g2d.fillRect(leftValueX, 10, imageSize, imageSize);

    // Draw the image, rotated so up is "forward" for the player
    g2d.save();
    g2d.setTransform(1, 0, 0, 1, leftValueX + imageSize / 2, 10 + imageSize / 2); // sets scale and origin
    g2d.rotate(upAngle);
    g2d.drawImage(
      this.mapCanvas,
      leftX,
      topY,
      imageSize,
      imageSize,
      -imageSize / 2,
      -imageSize / 2,
      imageSize,
      imageSize,
    );
    g2d.restore();

    // Add a border
    g2d.beginPath();
    g2d.rect(leftValueX, 10, imageSize, imageSize);
    g2d.strokeStyle = 'brown';
    g2d.lineWidth = 4;
    g2d.stroke();

    // Also draw an arrow to represent the player
    const arrowAngle = upAngle + (3 * Math.PI) / 2;
    g2d.strokeStyle = 'red';
    g2d.lineWidth = 2.0;
    drawArrow(g2d, leftValueX + imageSize / 2, 10 + imageSize / 2, arrowAngle, TILE_SIZE_PX);

    // Draw a circle for the compass
    g2d.beginPath();
    g2d.arc(leftValueX + imageSize / 2, 10 + imageSize / 2, TILE_SIZE_PX, 0, 2 * Math.PI);
    g2d.strokeStyle = 'black';
    g2d.lineWidth = 1.0;
    g2d.stroke();

    // Draw the compass letters (N,S,E,W)
    g2d.fillStyle = 'red';
    g2d.font = '10pt sans-serif';
    g2d.textAlign = 'center';
    g2d.textBaseline = 'middle';
    g2d.fillText(
      'N',
      leftValueX + imageSize / 2 + TILE_SIZE_PX * Math.cos(arrowAngle),
      10 + imageSize / 2 + TILE_SIZE_PX * Math.sin(arrowAngle),
    );
    g2d.fillStyle = 'white';
    g2d.fillText(
      'S',
      leftValueX + imageSize / 2 + TILE_SIZE_PX * Math.cos(arrowAngle + Math.PI),
      10 + imageSize / 2 + TILE_SIZE_PX * Math.sin(arrowAngle + Math.PI),
    );
    g2d.fillText(
      'W',
      leftValueX + imageSize / 2 + TILE_SIZE_PX * Math.cos(arrowAngle - Math.PI / 2),
      10 + imageSize / 2 + TILE_SIZE_PX * Math.sin(arrowAngle - Math.PI / 2),
    );
    g2d.fillText(
      'E',
      leftValueX + imageSize / 2 + TILE_SIZE_PX * Math.cos(arrowAngle + Math.PI / 2),
      10 + imageSize / 2 + TILE_SIZE_PX * Math.sin(arrowAngle + Math.PI / 2),
    );
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
  const headY = centerY + (r / 2) * Math.sin(angle);
  const tailX = centerX - (r / 2) * Math.cos(angle);
  const tailY = centerY - (r / 2) * Math.sin(angle);
  console.log(angle);

  const headLen = 6;
  const headAngle = Math.PI / 6;

  g2d.beginPath();
  g2d.moveTo(tailX, tailY);
  g2d.lineTo(headX, headY);
  g2d.lineTo(headX - headLen * Math.cos(angle - headAngle), headY - headLen * Math.sin(angle - headAngle));
  g2d.moveTo(headX, headY);
  g2d.lineTo(headX - headLen * Math.cos(angle + headAngle), headY - headLen * Math.sin(angle + headAngle));
  g2d.stroke();
}
