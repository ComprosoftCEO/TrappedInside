import { DoorColor } from 'entities/DoorColor';

/**
 * Stores information about the in-game inventory
 */
export class Inventory {
  private keysCollected: Record<DoorColor, number> = {
    [DoorColor.Red]: 0,
    [DoorColor.Yellow]: 0,
    [DoorColor.Green]: 0,
    [DoorColor.Blue]: 0,
  };

  private batteryCollected = false;

  public collectKey(color: DoorColor): void {
    this.keysCollected[color] += 1;
  }

  public getKeyCount(color: DoorColor): number {
    return this.keysCollected[color];
  }

  public hasKeyAvailable(color: DoorColor): boolean {
    return this.getKeyCount(color) > 0;
  }

  public useKey(color: DoorColor): boolean {
    if (this.keysCollected[color] > 0) {
      this.keysCollected[color] -= 1;
      return true;
    } else {
      return false;
    }
  }

  public collectBattery(): void {
    this.batteryCollected = true;
  }

  public hasCollectedBattery(): boolean {
    return this.batteryCollected;
  }

  public useBattery(): boolean {
    if (this.batteryCollected) {
      this.batteryCollected = false;
      return true;
    } else {
      return false;
    }
  }
}
