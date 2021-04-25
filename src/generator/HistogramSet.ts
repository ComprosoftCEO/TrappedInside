import { randomInt } from 'engine/helpers';
import { AbstractSet } from './AbstractSet';
import { TreeNode } from './TreeNode';

/**
 * Stores a set of vertices, and can find random vertices based on their depth
 */
export class HistogramSet extends AbstractSet {
  /// Maps the depth to all vertices at that depth
  private vertices: Map<number, Set<TreeNode>> = new Map();

  /// Highest value that has been stored in the set
  private highest = 0;

  /**
   * Create a new histogram set for a tree of vertices
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
   * Get the highest depth that has been stored inside this historgram.
   * This does NOT guarantee that there are any nodes in this highest value.
   */
  public get highestDepth(): number {
    return this.highest;
  }

  /**
   * Test if a node exists inside the histogram
   */
  public hasNode(node: TreeNode): boolean {
    return this.vertices.has(node.depth) && this.vertices.get(node.depth).has(node);
  }

  /**
   * Add a single node to the set, but not all of its children
   */
  public add(node: TreeNode): void {
    // Create the set if it does not exist
    if (!this.vertices.has(node.depth)) {
      this.vertices.set(node.depth, new Set());
    }

    const set = this.vertices.get(node.depth);
    set.add(node);
    this.highest = Math.max(this.highest, node.depth);
  }

  /**
   * Remove a single node from the set, but not all of its children
   */
  public remove(node: TreeNode): void {
    if (!this.vertices.has(node.depth)) {
      return;
    }

    const set = this.vertices.get(node.depth);
    set.delete(node);
  }

  /**
   * Pick a random node that has a minDepth <= depth <= maxDepth.
   * This does NOT remove the node from the tree, just returns the node.
   *
   * @param minDepth Minimum depth, inclusive
   * @param maxDepth Maximum depth, inclusive
   * @param minAbsoluteDepth Minimum absolute depth (inclusive) for the node to ensure it has enough parents
   */
  public pickRandom(minDepth: number, maxDepth: number, minAbsoluteDepth = 0): TreeNode | null {
    const allNodes = [];
    for (let depth = minDepth; depth <= maxDepth; depth += 1) {
      if (!this.vertices.has(depth)) {
        continue;
      }

      const set = this.vertices.get(depth);
      allNodes.push(...set);
    }

    if (allNodes.length === 0) {
      return null;
    }

    // Probe all nodes linearly starting at a random location for an appropirate minimum absolute depth
    //  This is to ensure there isn't an infinite loop if no node is found
    let nodeIndex = randomInt(0, allNodes.length - 1);
    const startIndex = nodeIndex;
    do {
      const node = allNodes[nodeIndex];
      if (node.absoluteDepth >= minAbsoluteDepth) {
        return node;
      }

      nodeIndex = (nodeIndex + 1) % allNodes.length;
    } while (nodeIndex !== startIndex);

    return null; // No node found
  }

  /**
   * Get the size of this set
   */
  public get size(): number {
    let total = 0;
    for (const [_, set] of this.vertices) {
      total += set.size;
    }
    return total;
  }

  /**
   * Extract all nodes from this histograpm
   */
  public getAllNodes(): TreeNode[] {
    const allNodes: TreeNode[] = [];
    for (const entry of this.vertices) {
      allNodes.push(...entry[1]);
    }

    return allNodes;
  }
}
