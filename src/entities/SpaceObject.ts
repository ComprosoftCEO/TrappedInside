import { EntityState } from 'engine/entity';

/**
 * Way to share movement between all space objects
 */
export interface SpaceObject extends EntityState {
  /**
   * Move an object in a given direction
   *
   * @param angle Direction, in radians, relative to the vertical axis
   * @param velocity Velocity to move (delta coordinates)
   */
  moveForward(angle: number, velocity: number): void;
}
