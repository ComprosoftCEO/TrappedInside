import { MazeObject } from 'areas/MazeObject';
import { HistogramSet } from './HistogramSet';
import { TreeNode } from './TreeNode';

/**
 * Adds a few random inverse toggle doors to the maze
 */
export class InverseToggleGenerator {
  private root: TreeNode;
  private maxDoors: number;

  private lever: TreeNode;
  private regularToggleDoors: Set<TreeNode> = new Set();
  private allowdSpots: HistogramSet;

  constructor(root: TreeNode) {
    this.root = root;
  }

  /**
   * Generate the inverse toggle doors
   */
  public generateInverseToggleDoors(): void {
    this.findToggleDoors(this.root);
    this.maxDoors = this.regularToggleDoors.size;
    this.allowdSpots = new HistogramSet(this.root);

    // Remove all paths connecting the lever to each toggle door
    for (const toggleDoor of this.regularToggleDoors) {
      const path = InverseToggleGenerator.findPathBetween(toggleDoor, this.lever);
      this.allowdSpots.removeAll(path);
    }

    // Remove all non-doors
    for (const spot of this.allowdSpots.getAllNodes()) {
      if (spot.row % 2 !== 0 && spot.column % 2 !== 0) {
        this.allowdSpots.remove(spot);
      }
    }

    // Pick random locations for the inverse doors
    //  We don't need to worry about recursive children because we aren't adding any more solid doors
    for (let door = 0; door < this.regularToggleDoors.size; door += 1) {
      const toggleLocation = this.allowdSpots.pickAnyRandom();
      if (toggleLocation === null) {
        return; /* No more doors left */
      }
      this.allowdSpots.remove(toggleLocation);
      toggleLocation.object = MazeObject.InverseToggleDoor;
    }
  }

  /**
   * Recursively find all of the toggle doors in the maze
   */
  private findToggleDoors(node: TreeNode): void {
    if (node.object === MazeObject.Lever) {
      this.lever = node; /* Should ONLY be one lever in the maze */
    } else if (node.object === MazeObject.ToggleDoor) {
      this.regularToggleDoors.add(node);
    }

    for (const child of node.children) {
      this.findToggleDoors(child);
    }
  }

  /**
   * Find the common path between the left and right nodes
   */
  private static findPathBetween(left: TreeNode, right: TreeNode): TreeNode[] {
    // Find left hieritage to the root
    const leftHeritage = [left];
    let parent = left.parent;
    while (parent !== null) {
      leftHeritage.push(parent);
      parent = parent.parent;
    }

    // Find right heritage to the root
    const rightHeritage = [right];
    parent = right.parent;
    while (parent !== null) {
      rightHeritage.push(parent);
      parent = parent.parent;
    }

    leftHeritage.reverse();
    rightHeritage.reverse();

    // Figure out where the heritage differs
    while (leftHeritage.length > 0 && rightHeritage.length > 0) {
      if (leftHeritage[0] !== rightHeritage[0]) {
        break;
      }
      leftHeritage.shift();
      rightHeritage.shift();
    }

    // The remaining nodes are the paths between the left and right
    const nodes = [...leftHeritage, ...rightHeritage];
    if (leftHeritage.length > 0) {
      nodes.push(leftHeritage[0].parent); // Should be the same for both
    } else if (rightHeritage.length > 0) {
      nodes.push(rightHeritage[0].parent); // Should be the same for both
    }

    return nodes;
  }
}
