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
  Portal,
}

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
  ['P']: MazeObject.Portal,
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
