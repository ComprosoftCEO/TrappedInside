import { MazeObject } from 'areas/MazeObject';

/**
 * Single tree node in the maze
 */
export interface TreeNode {
  row: number;
  column: number;
  object: MazeObject;

  parent: TreeNode | null;
  children: TreeNode[];
}

// Up, down, left, right deltas
const ALL_DIRECTIONS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/**
 * Convert a boolean wall maze to a tree structure.
 *
 * This method assumes that the maze walls are perfectly connected, or else it will loop forever.
 *
 * @param maze The walls inside the maze
 * @param rootRow Row for the root node
 * @param rootCol Column for the root node
 * @param lastPosition Parent location in the maze. Used for recursion, leave undefined if calling this in the root.
 */
export function buildTreeNodes(
  maze: boolean[][],
  rootRow: number,
  rootCol: number,
  lastPosition?: [number, number],
): TreeNode {
  const rootNode: TreeNode = {
    row: rootRow,
    column: rootCol,
    object: MazeObject.Empty,
    parent: null,
    children: [],
  };

  // Recursively add all children to the tree using depth-first search
  for (const [deltaRow, deltaCol] of ALL_DIRECTIONS) {
    const newRow = rootRow + deltaRow;
    const newCol = rootCol + deltaCol;

    if (maze[newRow][newCol]) {
      continue; /* There is a wall here */
    }
    if (typeof lastPosition !== 'undefined' && newRow === lastPosition[0] && newCol === lastPosition[1]) {
      continue; /* We have already been here */
    }

    const child = buildTreeNodes(maze, newRow, newCol, [rootRow, rootCol]);
    child.parent = rootNode;
    rootNode.children.push(child);
  }

  return rootNode;
}
