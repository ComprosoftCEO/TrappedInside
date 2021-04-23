import { ElectricBoxType } from 'entities/ElectricBoxType';

/**
 * Handles the state of the doors in the room
 */
export class DoorState {
  /// Big Door!
  private bigDoorOpened = false;

  // Colored doors
  private coloredDoors: Set<string> = new Set();

  // Toggled doors
  private toggle = false;

  // Powered doors
  private powered: Record<ElectricBoxType, boolean> = {
    [ElectricBoxType.A]: false,
    [ElectricBoxType.B]: false,
    [ElectricBoxType.C]: false,
  };

  public isBigDoorOpened(): boolean {
    return this.bigDoorOpened;
  }

  public openBigDoor(): void {
    this.bigDoorOpened = true;
  }

  public isColoredDoorOpened(row: number, col: number): boolean {
    return this.coloredDoors.has(`${row}-${col}`);
  }

  public setColoredDoorOpened(row: number, col: number): void {
    this.coloredDoors.add(`${row}-${col}`);
  }

  public getToggleState(): boolean {
    return this.toggle;
  }

  public toggleDoors(): void {
    this.toggle = !this.toggle;
  }

  public isDoorPowered(type: ElectricBoxType): boolean {
    return this.powered[type];
  }

  public setDoorPowered(type: ElectricBoxType, powered: boolean): void {
    this.powered[type] = powered;
  }
}
