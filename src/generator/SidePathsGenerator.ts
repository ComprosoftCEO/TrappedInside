import { ALL_MAIN_DOORS, DOOR_ITEMS, MazeObject } from 'areas/MazeObject';
import { pickRandomArray } from 'engine/helpers';
import { HistogramSet } from './HistogramSet';
import { TreeNode } from './TreeNode';
import { VertexSet } from './VertexSet';

const ITEM_NODES = new Set([
  MazeObject.RedKey,
  MazeObject.YellowKey,
  MazeObject.GreenKey,
  MazeObject.BlueKey,
  MazeObject.Lever,
  MazeObject.Battery,
  MazeObject.ABox,
  MazeObject.BBox,
  MazeObject.CBox,
]);

const WINDOW_SIZE = 2;

/**
 * Generate all of the side paths for this maze
 */
export class SidePathsGenerator {
  private root: TreeNode;

  private mainNodes: HistogramSet;
  private sideNodes: HistogramSet;
  private minDepth: number;

  constructor(root: TreeNode) {
    this.root = root;
  }

  /**
   * Generate the side paths, mutates the internal nodes.
   * This method should only be called once!!!
   */
  public generateSidePaths(): void {
    this.mainNodes = new HistogramSet();
    this.sideNodes = new HistogramSet(this.root);

    this.processItemNodes(this.root);
    this.minDepth = Math.max(0, this.sideNodes.highestDepth - Math.floor(WINDOW_SIZE / 2));

    // Make sure none of the main nodes and side nodes already have items
    for (const node of this.sideNodes.getAllNodes()) {
      if (node.object !== MazeObject.Empty) {
        this.sideNodes.remove(node);
      }
    }
    for (const node of this.mainNodes.getAllNodes()) {
      if (node.object !== MazeObject.Empty) {
        this.mainNodes.remove(node);
      }
    }

    do {
      this.addSingleRandomDoor();
      this.shiftMinDepth();
    } while (this.minDepth > 0);
  }

  /**
   * Compute the nodes on the main path and on the sub paths
   */
  private processItemNodes(node: TreeNode): void {
    if (ITEM_NODES.has(node.object)) {
      this.mainNodes.addParents(node);
      this.sideNodes.removeParents(node);
    }

    for (const child of node.children) {
      this.processItemNodes(child);
    }
  }

  /**
   * Add a single random door into the maze.
   */
  private addSingleRandomDoor(): void {
    // 1. Pick a random location for the door, or abort on failure
    const doorLocation = this.pickRandomDoorLocation();
    if (doorLocation === null) {
      return; // No door found, abort!
    }
    this.sideNodes.removeRecursive(doorLocation);

    // 2. Pick a random type for the door
    //  Also put an energy object behind the door
    const doorType = pickRandomArray(ALL_MAIN_DOORS);
    doorLocation.object = doorType;
    SidePathsGenerator.putEnergyBehind(doorLocation);

    // 3. Get the items needed to open the doors
    //  The previous step already added all reusable items, so this step can be skipped
    const itemTypes = DOOR_ITEMS[doorType];
    if (typeof itemTypes.oneTimeItem === 'undefined' || typeof itemTypes.reuseItem !== 'undefined') {
      return; /* The previous algorithm already added all reusable algorithms, so ignore */
    }

    // 4. Pick a location for the item, or abort on failure
    const oneTimeItem = itemTypes.oneTimeItem;
    const itemLocation = this.mainNodes.pickRandom(0, this.mainNodes.highestDepth);
    if (itemLocation === null) {
      doorLocation.object = MazeObject.Empty;
      return; // No item location found, abort!
    }
    itemLocation.object = oneTimeItem;
    this.mainNodes.remove(itemLocation); /* Only removes one node */
  }

  /**
   * Doors can only go in specific locations
   */
  private pickRandomDoorLocation(): TreeNode | null {
    // Only try a fixed number of times before giving up
    for (let i = 0; i < 10; i += 1) {
      const location = this.sideNodes.pickRandom(this.minDepth, this.minDepth + WINDOW_SIZE, 2);
      if (location === null) {
        return null;
      }

      // Make sure this is a valid door node
      if (location.row % 2 !== 0 && location.column % 2 !== 0) {
        // Make sure the parent is still a valid side node
        if (this.sideNodes.hasNode(location.parent)) {
          return location.parent;
        } else {
          continue; // Okay, try again
        }
      } else {
        return location;
      }
    }

    return null;
  }

  /**
   * Increase the minimum depth so items are *approximately* uniformly distributed in the maze
   */
  private shiftMinDepth(): void {
    this.minDepth = Math.max(0, this.minDepth - 1);
  }

  /**
   * Add an energy orb to a random child of the door node
   */
  private static putEnergyBehind(doorNode: TreeNode): void {
    // Find available slots behind the door
    const availableNodes = new VertexSet(doorNode);
    availableNodes.remove(doorNode);
    for (const node of availableNodes.getAllNodes()) {
      if (node.object !== MazeObject.Empty) {
        // Don't put two behind the same door
        availableNodes.removeRecursive(node);
      }
    }

    const energyLocation = availableNodes.pickAnyRandom();
    if (energyLocation !== null) {
      energyLocation.object = MazeObject.Energy;
    }
  }
}
