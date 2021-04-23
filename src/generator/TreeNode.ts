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
  depth: number;
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
 */
export function buildTreeNodes(maze: boolean[][], rootRow: number, rootCol: number): TreeNode {
  return buildTreeNodesRecurse(maze, rootRow, rootCol, 0, NaN, NaN);
}

/// Recursive method to check for pre-visited tiles and handle the depth
function buildTreeNodesRecurse(
  maze: boolean[][],
  rootRow: number,
  rootCol: number,
  depth: number,
  lastRow: number,
  lastCol: number,
): TreeNode {
  const rootNode: TreeNode = {
    row: rootRow,
    column: rootCol,
    object: MazeObject.Empty,
    parent: null,
    children: [],
    depth,
  };

  // Find the possible children directions for this node
  //
  // A direction is allowed if:
  //    1. It isn't a wall
  //    2. We haven't previously visited this direction
  const childDirections = ALL_DIRECTIONS.map(([deltaRow, deltaCol]) => [rootRow + deltaRow, rootCol + deltaCol])
    .filter(([newRow, newCol]) => !maze[newRow][newCol])
    .filter(([newRow, newCol]) => !(newRow === lastRow && newCol === lastCol));

  // Only consider it a new depth at each "fork" in the maze
  const newDepth = depth + Number(childDirections.length > 1);

  // Recursively add all children to the tree using depth-first search
  for (const [newRow, newCol] of childDirections) {
    const child = buildTreeNodesRecurse(maze, newRow, newCol, newDepth, rootRow, rootCol);
    child.parent = rootNode;
    rootNode.children.push(child);
  }

  return rootNode;
}
