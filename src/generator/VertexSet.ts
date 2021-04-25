import { pickRandomArray } from 'engine/helpers';
import { AbstractSet } from './AbstractSet';
import { TreeNode } from './TreeNode';

/**
 * Simple set wrapper with helper methods for the vertex tree
 */
export class VertexSet extends AbstractSet {
  /// Set of nodes
  private set: Set<TreeNode> = new Set();

  /**
   * Create a new set for a tree of vertices
   *
   * @param rootNode If provided, adds the node AND all of its children to the set
   */
  constructor(rootNode?: TreeNode) {
    super();
    if (typeof rootNode !== 'undefined') {
      this.addRecursive(rootNode);
    }
  }

  /**
   * Test if a node exists inside the set
   */
  public hasNode(node: TreeNode): boolean {
    return this.set.has(node);
  }

  /**
   * Add a single node to the set, but not all of its children
   */
  public add(node: TreeNode): void {
    this.set.add(node);
  }

  /**
   * Remove a single node from the set, but not all of its children
   */
  public remove(node: TreeNode): void {
    this.set.delete(node);
  }

  /**
   * Get all nodes in the set
   */
  public getAllNodes(): TreeNode[] {
    return Array.from(this.set);
  }

  /**
   * Get the size of this set
   */
  public get size(): number {
    return this.set.size;
  }

  /**
   * Pick any random node in the set
   */
  public pickAnyRandom(): TreeNode | null {
    const nodes = this.getAllNodes();
    if (nodes.length === 0) {
      return null;
    } else {
      return pickRandomArray(nodes);
    }
  }
}
