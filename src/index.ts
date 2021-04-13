import { MainArea } from 'areas/MainArea';
import { Game } from 'engine/game';
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

const canvas = document.createElement('canvas');
canvas.setAttribute('tabindex', '0');
document.body.appendChild(canvas);

const game = new Game(canvas);
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
  ]);

  return game;
}
