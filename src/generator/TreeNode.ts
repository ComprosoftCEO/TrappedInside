/**
 * Single tree node in the maze
 */
export interface TreeNode {
  row: number;
  column: number;

  parent: TreeNode | null;
  children: TreeNode[];
}
