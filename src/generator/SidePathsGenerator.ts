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

const COLORED_DOORS = new Set([MazeObject.RedDoor, MazeObject.YellowDoor, MazeObject.GreenDoor, MazeObject.BlueDoor]);

const WINDOW_SIZE = 2;

/**
 * Generate all of the side paths for this maze
 */
export class SidePathsGenerator {
  private root: TreeNode;

  private mainNodes: HistogramSet;
  private sideNodeDoors: HistogramSet; /* Only stores doors */
  private minDepth: number;

  // Find the colored door instances (Special case)
  private coloredDoor: Map<MazeObject, TreeNode> = new Map();

  constructor(root: TreeNode) {
    this.root = root;
  }

  /**
   * Generate the side paths, mutates the internal nodes.
   * This method should only be called once!!!
   */
  public generateSidePaths(): void {
    this.mainNodes = new HistogramSet();
    this.sideNodeDoors = new HistogramSet(this.root);

    this.processItemNodes(this.root);
    this.minDepth = Math.max(0, this.sideNodeDoors.highestDepth - Math.floor(WINDOW_SIZE / 2));

    do {
      this.addSingleRandomDoor();
      this.shiftMinDepth();
    } while (this.minDepth > 0);
  }

  /**
   * Compute the nodes on the main path and on the sub paths
   */
  private processItemNodes(node: TreeNode): void {
    this.loadItemNodesRecursive(node);

    // Remove any items from the main nodes
    for (const node of this.mainNodes.getAllNodes()) {
      if (node.object !== MazeObject.Empty) {
        this.mainNodes.remove(node);
      }
    }

    // Remove any non-doors and leftover items from the side nodes
    for (const node of this.sideNodeDoors.getAllNodes()) {
      if (node.object !== MazeObject.Empty) {
        this.sideNodeDoors.remove(node);
      }
      if (node.row % 2 !== 0 && node.column % 2 !== 0) {
        this.sideNodeDoors.remove(node);
      }
    }
  }

  /**
   * Recursively load all item nodes into the maze
   */
  private loadItemNodesRecursive(node: TreeNode): void {
    // The main path is defined by all item nodes to the root
    if (ITEM_NODES.has(node.object)) {
      this.mainNodes.addParents(node);
      this.sideNodeDoors.removeParents(node);
    }

    // Handle the colored doors
    //  There should only be one of each colored door in the main path
    if (COLORED_DOORS.has(node.object)) {
      this.coloredDoor.set(node.object, node);
    }

    // Recurse!
    for (const child of node.children) {
      this.loadItemNodesRecursive(child);
    }
  }

  /**
   * Add a single random door into the maze.
   */
  private addSingleRandomDoor(): void {
    // 1. Pick a random type for the door
    const doorType = pickRandomArray(ALL_MAIN_DOORS);

    // 2. Pick a random location for the door, or abort on failure
    //  Handles a special case for colored doors
    //  Also put an energy object behind the door
    const doorLocation = this.pickRandomDoorLocation(this.coloredDoor.get(doorType));
    if (doorLocation === null) {
      return; // No door found, abort!
    }
    this.sideNodeDoors.removeRecursive(doorLocation);

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
  private pickRandomDoorLocation(parent?: TreeNode): TreeNode | null {
    const allAllowed = new VertexSet();
    allAllowed.addAll(this.sideNodeDoors.getAllNodesBy(this.minDepth, this.minDepth + WINDOW_SIZE, 2));

    // If specified, nodes must be a parent of the parent node.
    //
    // This fixes a special case:
    //   For colored doors, the colored door in the main path must be the parent
    //   Otherwise, the colored key could open the side door and make the maze impossible
    if (typeof parent !== 'undefined') {
      for (const node of allAllowed.getAllNodes()) {
        if (!SidePathsGenerator.isParentOf(parent, node)) {
          allAllowed.remove(node);
        }
      }
    }

    return allAllowed.pickAnyRandom();
  }

  /**
   * Test if a node is the parent of the other node
   *
   * @param parent Expected parent node
   * @param node Node being tested
   */
  private static isParentOf(parent: TreeNode, node: TreeNode): boolean {
    let tempParent = node.parent;
    while (tempParent !== null) {
      if (tempParent === parent) {
        return true;
      }
      tempParent = tempParent.parent;
    }

    return false;
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
