import { Entity, EntityState } from 'engine/entity';
import { isBetween } from 'engine/helpers';
import { MouseButton } from 'engine/input';
import * as THREE from 'three';

/**
 * Abstract button class for drawing
 */
export abstract class AbstractButton {
  // Properties that can be adjusted
  public x = 0;
  public y = 0;
  public width = 10;
  public height = 10;

  public text: string;
  public font = '12pt sans-serif';
  public textColor = new THREE.Color('white');
  public backgroundColor = new THREE.Color('black');
  public borderColor = new THREE.Color('white');

  protected entity: Entity<EntityState>;
  private hoveringOver = false;

  constructor(text: string) {
    this.text = text;
  }

  /**
   * Event handler for clicking on the button
   */
  abstract onClick(): void;

  /**
   * Internal wrapper for stepping the button
   */
  abstract onCreateButton(): void;

  /**
   * Internal wrapper for stepping the button
   */
  abstract onStepButton(): void;

  onCreate(entity: Entity<EntityState>): void {
    this.entity = entity;
    this.onCreateButton();
  }

  onStep(): void {
    // Test if the mouse is hovering
    const input = this.entity.area.game.input;
    this.hoveringOver =
      isBetween(input.getMouseX(), this.x, this.x + this.width) &&
      isBetween(input.getMouseY(), this.y, this.y + this.height);

    // Test for on-click
    if (this.hoveringOver && input.isMouseButtonStarted(MouseButton.Left)) {
      this.onClick();
    }

    this.onStepButton();
  }

  onDraw(g2d: CanvasRenderingContext2D): void {
    // Compute opacity
    g2d.globalAlpha = this.hoveringOver ? 1 : 0.5;

    // Background
    g2d.fillStyle = `#${this.backgroundColor.getHexString()}`;
    g2d.fillRect(this.x, this.y, this.width, this.height);

    // Test
    g2d.font = this.font;
    g2d.textAlign = 'center';
    g2d.textBaseline = 'middle';
    g2d.fillStyle = `#${this.textColor.getHexString()}`;
    g2d.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);

    //Outline
    g2d.beginPath();
    g2d.rect(this.x, this.y, this.width, this.height);
    g2d.lineWidth = 1;
    g2d.strokeStyle = `#${this.borderColor.getHexString()}`;
    g2d.stroke();

    // Reset lapha
    g2d.globalAlpha = 1;
  }
}
