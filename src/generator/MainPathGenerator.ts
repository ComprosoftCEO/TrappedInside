import { ALL_MAIN_DOORS, DOOR_ITEMS, MazeObject } from 'areas/MazeObject';
import { pickRandomArray, randomInt } from 'engine/helpers';
import { HistogramSet } from './HistogramSet';
import { TreeNode } from './TreeNode';

const WINDOW_SIZE = 5;
const MIN_RANDOM_PARENT = 3;
const MAX_RANDOM_PARENT = 7;

/**
 * Generate the main path in a maze given the root node.
 */
export class MainPathGenerator {
  private root: TreeNode;
  private hist: HistogramSet;
  private minDepth: number;

  private doorsLeft: Set<MazeObject>;
  private itemsNeeded: MazeObject[];
  private itemsReused: Set<MazeObject>;

  constructor(node: TreeNode) {
    this.root = node;
  }

  /**
   * Generate the main path, mutates the internal nodes.
   * This method should only be called once!!!
   */
  public generateMainPath(): void {
    // Keep runing and rerunning the algorithm until it actually places all doors
    do {
      this.resetAlgorithm();
      this.runAlgorithmOnce();
    } while (this.doorsLeft.size > 0);
  }

  /**
   * Reset all of the internal algorithm parameters
   */
  private resetAlgorithm(): void {
    MainPathGenerator.resetVertices(this.root);
    this.hist = new HistogramSet(this.root);
    this.minDepth = Math.max(0, this.hist.highestDepth - Math.floor(WINDOW_SIZE / 2));

    this.doorsLeft = new Set(ALL_MAIN_DOORS);
    this.itemsNeeded = [];
    this.itemsReused = new Set();
  }

  /**
   * Recursively reset the state of all vertices
   */
  private static resetVertices(root: TreeNode): void {
    root.object = MazeObject.Empty;
    for (const child of root.children) {
      MainPathGenerator.resetVertices(child);
    }
  }

  /**
   * Attempts to run the algorithm once, but aborts if it fails
   */
  private runAlgorithmOnce(): void {
    // 1. Pick random location for the door
    let doorLocation = this.pickRandomDoorLocation();
    if (doorLocation === null) {
      return;
    }
    this.hist.removeRecursive(doorLocation);
    this.shiftMinDepth();

    // 2. Pick a random door type
    let randomDoor = pickRandomArray(Array.from(this.doorsLeft));
    this.doorsLeft.delete(randomDoor);
    doorLocation.object = randomDoor;

    // 3. Find the items needed for the door
    this.computeItemsNeeded(randomDoor);

    // 4. Add doors and items until there are no doors left
    outerLoop: while (this.itemsNeeded.length > 0) {
      const needed = [...this.itemsNeeded];
      this.itemsNeeded = [];

      // If multiple items are specified, then pick a random one for the door
      const doorIndex = randomInt(0, needed.length - 1);
      let doorItemNode: TreeNode;

      // 5. Pick a random location for all the items in the maze
      for (const [itemIndex, item] of needed.entries()) {
        // Pick an item location, if any are avaiable.
        //   If no item locations are available, remove the last door, any leftover items, and kill the algorithm
        const itemLocation = this.pickRandomItemLocation();
        if (itemLocation === null) {
          doorLocation.object = MazeObject.Empty;
          this.doorsLeft.add(randomDoor);
          break outerLoop;
        }

        // Okay, a location exists so add the item to the maze
        itemLocation.object = item;
        this.hist.removeRecursive(itemLocation);

        // Which item gets the door?
        if (itemIndex === doorIndex) {
          doorItemNode = itemLocation;
        }
      }

      // 6. Put a random door one one of the items
      if (this.doorsLeft.size > 0) {
        // If no door locations are available, the kill the algorithm
        doorLocation = this.pickRandomParentDoorLocation(doorItemNode);
        if (doorLocation === null) {
          break outerLoop;
        }
        this.hist.removeRecursive(doorLocation);

        // Pick the random item for the door
        randomDoor = pickRandomArray(Array.from(this.doorsLeft));
        this.doorsLeft.delete(randomDoor);
        doorLocation.object = randomDoor;

        // Also any items needed to open the door
        this.computeItemsNeeded(randomDoor);
      }

      this.shiftMinDepth();
    }
  }

  /**
   * Doors can only go in specific locations
   */
  private pickRandomDoorLocation(): TreeNode | null {
    const location = this.hist.pickRandom(this.minDepth, this.minDepth + WINDOW_SIZE, 2 + MAX_RANDOM_PARENT);
    if (location === null) {
      return null;
    }

    if (location.row % 2 !== 0 && location.column % 2 !== 0) {
      return location.parent;
    } else {
      return location;
    }
  }

  /**
   * Pick a door for the item by traveling back a given number of spots.
   * Doors can only go in specific locations.
   */
  private pickRandomParentDoorLocation(item: TreeNode): TreeNode | null {
    const parentsToTravel = randomInt(MIN_RANDOM_PARENT, MAX_RANDOM_PARENT);

    let location: TreeNode | null = item;
    for (let i = 0; i < parentsToTravel; i += 1) {
      location = location.parent;
    }

    if (location.row % 2 !== 0 && location.column % 2 !== 0) {
      return location.parent;
    } else {
      return location;
    }
  }

  /**
   * Items can go in all locations
   */
  private pickRandomItemLocation(): TreeNode | null {
    return this.hist.pickRandom(this.minDepth, this.minDepth + WINDOW_SIZE, 2 + MAX_RANDOM_PARENT);
  }

  /**
   * Increase the minimum depth so items are *approximately* uniformly distributed in the maze
   */
  private shiftMinDepth(): void {
    this.minDepth = Math.max(0, this.minDepth - 1);
  }

  /**
   * Compute the item(s) needed to open the door, and push them to the itemsNeeded array
   */
  private computeItemsNeeded(door: MazeObject): void {
    const itemsNeeded = DOOR_ITEMS[door];

    if (typeof itemsNeeded.oneTimeItem !== 'undefined') {
      this.itemsNeeded.push(itemsNeeded.oneTimeItem);
    }

    if (typeof itemsNeeded.reuseItem !== 'undefined' && !this.itemsReused.has(itemsNeeded.reuseItem)) {
      this.itemsNeeded.push(itemsNeeded.reuseItem);
      this.itemsReused.add(itemsNeeded.reuseItem);
    }
  }
}
