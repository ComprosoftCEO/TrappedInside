import { MainArea } from 'areas/MainArea';
import { Game } from 'engine/game';
import * as THREE from 'three';
import './styles.css';

// Textures
import SkyboxPosX from 'assets/skybox/posx.jpg';
import SkyboxNegX from 'assets/skybox/negx.jpg';
import SkyboxPosY from 'assets/skybox/posy.jpg';
import SkyboxNegY from 'assets/skybox/negy.jpg';
import SkyboxPosZ from 'assets/skybox/posz.jpg';
import SkyboxNegZ from 'assets/skybox/negz.jpg';
import GrassColor from 'assets/textures/grass-color.png';
import GrassNrm from 'assets/textures/grass-normal.png';
import GrassOcc from 'assets/textures/grass-occ.png';
import BrickColor from 'assets/textures/brick-color.jpg';
import BrickNrm from 'assets/textures/brick-normal.jpg';
import BrickOcc from 'assets/textures/brick-occ.jpg';

// Objects
import Wall from 'assets/objects/Wall.glb';
import Door from 'assets/objects/Door.glb';
import ToggleDoor from 'assets/objects/ToggleDoor.glb';
import ElectricDoor from 'assets/objects/ElectricDoor.glb';
import Key from 'assets/objects/Key.glb';
import Battery from 'assets/objects/Battery.glb';
import Lever from 'assets/objects/Lever.glb';
import ElectricBox from 'assets/objects/ElectricBox.glb';
import Rock from 'assets/objects/Rock.glb';
import Drone from 'assets/objects/Drone.glb';
import Gun from 'assets/objects/Gun.glb';
import MazeMap from 'assets/objects/Map.glb';
import Explosion from 'assets/objects/Explosion.glb';
import Portal from 'assets/objects/Portal.glb';

// Images
import RedKey from 'assets/images/RedKey.png';
import YellowKey from 'assets/images/YellowKey.png';
import GreenKey from 'assets/images/GreenKey.png';
import BlueKey from 'assets/images/BlueKey.png';
import Energy from 'assets/images/Energy.png';
import BatteryIcon from 'assets/images/Battery.png';
import LeverIcon from 'assets/images/Lever.png';
import LeverReverseIcon from 'assets/images/LeverReverse.png';
import ElectricBoxIcon from 'assets/images/ElectricBox.png';
import GunIcon from 'assets/images/Gun.png';
import MapIcon from 'assets/images/Map.png';

// Build the canvas objects
const gameCanvas = document.createElement('canvas');
document.body.appendChild(gameCanvas);

const overlayCanvas = document.createElement('canvas');
overlayCanvas.setAttribute('tabindex', '0');
overlayCanvas.classList.add('overlay');
document.body.appendChild(overlayCanvas);

const game = new Game(gameCanvas, overlayCanvas);
// game.screenSize = [640, 480];
loadAllAssets(game)
  .then((game) => {
    game.start(new MainArea());
  })
  .catch((error) => {
    console.log('Failed to load assets: ' + error, error.stack);
  });

/**
 * Load all of the game assets asynchronously
 */
async function loadAllAssets(game: Game): Promise<Game> {
  await Promise.all([
    game.assets.loadTexture('GrassColor', GrassColor),
    game.assets.loadTexture('GrassNormal', GrassNrm),
    game.assets.loadTexture('GrassOcclusion', GrassOcc),
    game.assets.loadTexture('BrickColor', BrickColor),
    game.assets.loadTexture('BrickNormal', BrickNrm),
    game.assets.loadTexture('BrickOcclusion', BrickOcc),
    game.assets.loadCubeTexture('SkyboxBG', {
      positiveX: SkyboxPosX,
      negativeX: SkyboxNegX,
      positiveY: SkyboxPosY,
      negativeY: SkyboxNegY,
      positiveZ: SkyboxPosZ,
      negativeZ: SkyboxNegZ,
    }),
    game.assets.loadGLTFFile(Wall, (glb, manager) => {
      manager.saveObject('Wall', glb.scene.children[0]);
    }),
    game.assets.loadGLTFFile(Door, (glb, manager) => {
      manager.saveObject('Door', glb.scene);
      for (const animation of glb.animations) {
        manager.saveAnimation(animation.name, animation);
      }

      // Fix the material
      adjustEmission(glb.scene.children[0].children[0] as THREE.Mesh, 0x737373, 0.25);
      adjustEmission(glb.scene.children[1] as THREE.Mesh, 0x7a6c6c, 0.25);
      adjustEmission(glb.scene.children[2] as THREE.Mesh, 0x7a6c6c, 0.25);
    }),
    game.assets.loadGLTFFile(ToggleDoor, (glb, manager) => {
      manager.saveObject('ToggleDoor', glb.scene);

      // Fix the material
      adjustEmission(glb.scene.children[0].children[0] as THREE.Mesh, 0x737373, 0.25);
      adjustEmission(glb.scene.children[0].children[1] as THREE.Mesh, 0x6900cc, 0.25);
      adjustEmission(glb.scene.children[1] as THREE.Mesh, 0x7a6c6c, 0.15);
      adjustEmission(glb.scene.children[2] as THREE.Mesh, 0x7a6c6c, 0.15);
    }),
    game.assets.loadGLTFFile(ElectricDoor, (glb, manager) => {
      manager.saveObject('ElectricDoor', glb.scene);

      // Fix the material
      adjustEmission(glb.scene.children[0].children[0] as THREE.Mesh, 0xffff00, 0.25);
      adjustEmission(glb.scene.children[1] as THREE.Mesh, 0xffffff, 0.3);
      adjustEmission(glb.scene.children[2] as THREE.Mesh, 0xffffff, 0.3);
    }),
    game.assets.loadGLTFFile(Lever, (glb, manager) => {
      manager.saveObject('Lever', glb.scene.children[0]);

      for (const animation of glb.animations) {
        manager.saveAnimation(animation.name, animation);
      }
    }),
    game.assets.loadGLTFFile(Key, (glb, manager) => {
      manager.saveObject('Key', glb.scene.children[0]);
    }),
    game.assets.loadGLTFFile(Battery, (glb, manager) => {
      manager.saveObject('Battery', glb.scene.children[0]);
    }),
    game.assets.loadGLTFFile(Drone, (glb, manager) => {
      const drone = glb.scene.children[0];
      manager.saveObject('Drone', drone);

      adjustEmission(drone.children[0] as THREE.Mesh, 0x737373, 0.5);
      adjustEmission(drone.children[2] as THREE.Mesh, 0x2760f2, 0.25);
    }),
    game.assets.loadGLTFFile(ElectricBox, (glb, manager) => {
      const box = glb.scene.children[0];
      manager.saveObject('ElectricBox', box);

      adjustEmission(box.children[0] as THREE.Mesh, 0x878787, 0.5);

      for (const animation of glb.animations) {
        manager.saveAnimation(animation.name, animation);
      }
    }),
    game.assets.loadGLTFFile(Rock, (glb, manager) => {
      manager.saveObject('Rock', glb.scene.children[0]);
    }),
    game.assets.loadGLTFFile(Gun, (glb, manager) => {
      manager.saveObject('Gun', glb.scene);
    }),
    game.assets.loadGLTFFile(MazeMap, (glb, manager) => {
      manager.saveObject('Map', glb.scene.children[0]);
    }),
    game.assets.loadGLTFFile(Explosion, (glb, manager) => {
      const explosion = glb.scene.children[0] as THREE.Mesh;
      manager.saveObject('Explosion', explosion);

      const material = explosion.material as THREE.MeshStandardMaterial;
      material.transparent = true;
      material.opacity = 0.75;
    }),
    game.assets.loadGLTFFile(Portal, (glb, manager) => {
      manager.saveObject('Portal', glb.scene);
      for (const animation of glb.animations) {
        manager.saveAnimation(animation.name, animation);
      }

      // Fix the portal materials
      adjustEmission(glb.scene.children[1] as THREE.Mesh, 0x511f1f, 0.25);
      const material = (glb.scene.children[2] as THREE.Mesh).material as THREE.MeshStandardMaterial;
      material.transparent = true;
      material.opacity = 0.8;
    }),
    game.assets.loadImage('RedKey', RedKey),
    game.assets.loadImage('YellowKey', YellowKey),
    game.assets.loadImage('GreenKey', GreenKey),
    game.assets.loadImage('BlueKey', BlueKey),
    game.assets.loadImage('Energy', Energy),
    game.assets.loadImage('Battery', BatteryIcon),
    game.assets.loadImage('Lever', LeverIcon),
    game.assets.loadImage('LeverReverse', LeverReverseIcon),
    game.assets.loadImage('ElectricBox', ElectricBoxIcon),
    game.assets.loadImage('Gun', GunIcon),
    game.assets.loadImage('Map', MapIcon),
  ]);

  return game;
}

function adjustEmission(mesh: THREE.Mesh, color: string | number | THREE.Color, intensity: number) {
  const material = mesh.material as THREE.MeshStandardMaterial;
  material.emissive.set(color);
  material.emissiveIntensity = intensity;
}
