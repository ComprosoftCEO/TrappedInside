import { DoorColor } from 'entities/DoorColor';

/**
 * Stores information about the in-game inventory
 */
export class Inventory {
  private mapCollected = false;
  private gunCollected = false;

  private keysCollected: Record<DoorColor, number> = {
    [DoorColor.Red]: 0,
    [DoorColor.Yellow]: 0,
    [DoorColor.Green]: 0,
    [DoorColor.Blue]: 0,
  };

  private batteryCollected = 0;

  public collectMap(): void {
    this.mapCollected = true;
  }

  public hasCollectedMap(): boolean {
    return this.mapCollected;
  }

  public collectGun(): void {
    this.gunCollected = true;
  }

  public hasCollectedGun(): boolean {
    return this.gunCollected;
  }

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
    this.batteryCollected += 1;
  }

  public getBatteryCount(): number {
    return this.batteryCollected;
  }

  public hasCollectedBattery(): boolean {
    return this.batteryCollected > 0;
  }

  public useBattery(): boolean {
    if (this.batteryCollected > 0) {
      this.batteryCollected -= 1;
      return true;
    } else {
      return false;
    }
  }
}
