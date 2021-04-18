import { MainArea } from 'areas/MainArea';
import { Game } from 'engine/game';
import * as THREE from 'three';
import './styles.css';

// Assets
import SkyboxPosX from 'assets/skybox/posx.jpg';
import SkyboxNegX from 'assets/skybox/negx.jpg';
import SkyboxPosY from 'assets/skybox/posy.jpg';
import SkyboxNegY from 'assets/skybox/negy.jpg';
import SkyboxPosZ from 'assets/skybox/posz.jpg';
import SkyboxNegZ from 'assets/skybox/negz.jpg';
import GrassColor from 'assets/textures/grass-color.jpg';
import GrassNrm from 'assets/textures/grass-normal.jpg';
import GrassOcc from 'assets/textures/grass-occ.jpg';
import BrickColor from 'assets/textures/brick-color.jpg';
import BrickNrm from 'assets/textures/brick-normal.jpg';
import BrickOcc from 'assets/textures/brick-occ.jpg';

import Wall from 'assets/objects/Wall.glb';
import Door from 'assets/objects/Door.glb';
import Key from 'assets/objects/Key.glb';
import Drone from 'assets/objects/Drone.glb';

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
    console.log('Failed to load assets: ' + error);
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
    game.assets.loadGLTFFile(Key, (glb, manager) => {
      manager.saveObject('Key', glb.scene.children[0]);
    }),
    game.assets.loadGLTFFile(Drone, (glb, manager) => {
      const drone = glb.scene.children[0];
      manager.saveObject('Drone', drone);

      adjustEmission(drone.children[0] as THREE.Mesh, 0x737373, 0.5);
      adjustEmission(drone.children[2] as THREE.Mesh, 0x2760f2, 0.25);
    }),
  ]);

  return game;
}

function adjustEmission(mesh: THREE.Mesh, color: string | number | THREE.Color, intensity: number) {
  const material = mesh.material as THREE.MeshStandardMaterial;
  material.emissive.set(color);
  material.emissiveIntensity = intensity;
}
