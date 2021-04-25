import { TreeNode } from './TreeNode';

/**
 * Base class for all of the vertex sets
 */
export abstract class AbstractSet {
  /**
   * Test if a node exists inside the set
   */
  public abstract hasNode(node: TreeNode): boolean;

  /**
   * Add a single node to the set, but not all of its children
   */
  public abstract add(node: TreeNode): void;

  /**
   * Add the node and all of its children to the set
   */
  public addRecursive(node: TreeNode): void {
    this.add(node);
    for (const child of node.children) {
      this.addRecursive(child);
    }
  }

  /**
   * Add the node and all of its parents to the set
   */
  public addParents(node: TreeNode): void {
    this.add(node);
    if (node.parent !== null) {
      this.addParents(node.parent);
    }
  }

  /**
   * Remove a single node from the set, but not all of its children
   */
  public abstract remove(node: TreeNode): void;

  /**
   * Remove an iterable set of nodes from the set
   */
  public removeAll(nodes: Iterable<TreeNode>): void {
    for (const node of nodes) {
      this.remove(node);
    }
  }

  /**
   * Remove a node and all of its children from the set
   */
  public removeRecursive(node: TreeNode): void {
    this.remove(node);
    for (const child of node.children) {
      this.removeRecursive(child);
    }
  }

  /**
   * Remove a node and all of its parents from the set
   */
  public removeParents(node: TreeNode): void {
    this.remove(node);
    if (node.parent !== null) {
      this.removeParents(node.parent);
    }
  }

  /**
   * Get the size of this set
   */
  public abstract get size(): number;

  /**
   * Extract all nodes from this set
   */
  public abstract getAllNodes(): TreeNode[];
}
