/// All objects that can be inside the maze
export enum MazeObject {
  Empty,
  Player,
  Wall,
  Rock,
  Energy,
  RedDoor,
  YellowDoor,
  GreenDoor,
  BlueDoor,
  RedKey,
  YellowKey,
  GreenKey,
  BlueKey,
  Battery,
  Lever,
  ToggleDoor,
  InverseToggleDoor,
  ADoor,
  BDoor,
  CDoor,
  ABox,
  BBox,
  CBox,
  Drone,
  BigDoor,
  Portal,
  Map,
  Gun,
}

/// List of main doors used by the generator
///  Note: Does not include the inverse toggle door, as this requires a special case algorithm
export const ALL_MAIN_DOORS: MazeObject[] = [
  MazeObject.RedDoor,
  MazeObject.YellowDoor,
  MazeObject.GreenDoor,
  MazeObject.BlueDoor,
  MazeObject.ToggleDoor,
  MazeObject.ADoor,
  MazeObject.BDoor,
  MazeObject.CDoor,
];

/// List of items required to open a door
export interface DoorItems {
  oneTimeItem?: MazeObject; // Items used once to open the door
  reuseItem?: MazeObject; // Item that is reused to open the door
}

export const DOOR_ITEMS: { [K in MazeObject]?: DoorItems } = {
  [MazeObject.RedDoor]: { oneTimeItem: MazeObject.RedKey },
  [MazeObject.YellowDoor]: { oneTimeItem: MazeObject.YellowKey },
  [MazeObject.GreenDoor]: { oneTimeItem: MazeObject.GreenKey },
  [MazeObject.BlueDoor]: { oneTimeItem: MazeObject.BlueKey },
  [MazeObject.ToggleDoor]: { reuseItem: MazeObject.Lever },
  [MazeObject.ADoor]: { oneTimeItem: MazeObject.Battery, reuseItem: MazeObject.ABox },
  [MazeObject.BDoor]: { oneTimeItem: MazeObject.Battery, reuseItem: MazeObject.BBox },
  [MazeObject.CDoor]: { oneTimeItem: MazeObject.Battery, reuseItem: MazeObject.CBox },
};

const MAZE_OBJECT_LOOKUP: Record<string, MazeObject> = {
  [' ']: MazeObject.Empty,
  ['S']: MazeObject.Player,
  ['#']: MazeObject.Wall,
  ['@']: MazeObject.Rock,
  ['*']: MazeObject.Energy,
  ['R']: MazeObject.RedDoor,
  ['Y']: MazeObject.YellowDoor,
  ['G']: MazeObject.GreenDoor,
  ['L']: MazeObject.BlueDoor,
  ['r']: MazeObject.RedKey,
  ['y']: MazeObject.YellowKey,
  ['g']: MazeObject.GreenKey,
  ['l']: MazeObject.BlueKey,
  [':']: MazeObject.Battery,
  ['/']: MazeObject.Lever,
  ['t']: MazeObject.ToggleDoor,
  ['T']: MazeObject.InverseToggleDoor,
  ['A']: MazeObject.ADoor,
  ['B']: MazeObject.BDoor,
  ['C']: MazeObject.CDoor,
  ['a']: MazeObject.ABox,
  ['b']: MazeObject.BBox,
  ['c']: MazeObject.CBox,
  ['d']: MazeObject.Drone,
  ['n']: MazeObject.BigDoor,
  ['P']: MazeObject.Portal,
  ['m']: MazeObject.Map,
  ['%']: MazeObject.Gun,
};

/**
 * Map a string to an array of maze objects
 */
export function stringToMaze(input: string): MazeObject[][] {
  // Split by newlines
  const lines = input.split(/\r?\n/);

  // Figure out the longest line
  let maxLength = 0;
  for (const line of lines) {
    maxLength = Math.max(maxLength, line.length);
  }

  const result: MazeObject[][] = [];
  for (const line of lines) {
    const mazeRow: MazeObject[] = [];
    for (const char of line) {
      const lookup = MAZE_OBJECT_LOOKUP[char];
      if (typeof lookup === 'undefined') {
        mazeRow.push(MazeObject.Empty);
      } else {
        mazeRow.push(lookup);
      }
    }

    // Make sure all lines are the same length
    while (mazeRow.length < maxLength) {
      mazeRow.push(MazeObject.Empty);
    }

    result.push(mazeRow);
  }

  return result;
}
