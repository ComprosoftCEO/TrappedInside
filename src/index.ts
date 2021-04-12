import { MainArea } from 'areas/MainArea';
import { Game } from 'engine/game';
import './styles.css';

// Assets
import MilkyWay_Img from 'assets/images/milky_way.png';
import SpaceShip_Obj from 'assets/objects/SpaceShip.glb';
import Asteroid_Obj from 'assets/objects/Asteroid.glb';
import Bullet_Obj from 'assets/objects/Bullet.glb';
import Shoot_Snd from 'assets/sounds/shoot.wav';
import Hit_Snd from 'assets/sounds/hit.wav';
import Explosion_Snd from 'assets/sounds/explosion.wav';
import BGM_Snd from 'assets/music/bgm.wav';

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
    game.assets.loadTexture('MilkyWayBG', MilkyWay_Img),
    game.assets.loadGLTFFile(SpaceShip_Obj, (gltf, manager) => {
      manager.saveObject('SpaceShip', gltf.scene.children[0]);
    }),
    game.assets.loadGLTFFile(Asteroid_Obj, (gltf, manager) => {
      manager.saveObject('Asteroid', gltf.scene.children[0]);
    }),
    game.assets.loadGLTFFile(Bullet_Obj, (gltf, manager) => {
      manager.saveObject('Bullet', gltf.scene.children[0]);
    }),
    game.assets.loadAudioFile('Shoot', Shoot_Snd),
    game.assets.loadAudioFile('Hit', Hit_Snd),
    game.assets.loadAudioFile('Explosion', Explosion_Snd),
    game.assets.loadAudioFile('BGM', BGM_Snd),
  ]);

  return game;
}
