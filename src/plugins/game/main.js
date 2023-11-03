import {threejs_component} from './component/threejs-component.js'; 
import {ammojs_component} from './component/ammojs-component.js';
// Entities  
import {entity_manager} from './entities/entity-manager.js';   
import {entity} from './entities/entity.js';    
// Rassemble les differents chargement (texture, sound...)
import {load_controller} from './load-controller.js'; 
// Map
import {map_builder} from './map/zombie-map-builder.js'
// Zombies spawn               
import {zombies_spawn} from './map/zombie-spawn.js'
// Setup player input, FPC, kinematic controller
import {player} from './map/player.js';               



export class QuickFPS1 {
  constructor(ammo) {
    this._Initialize();
    this.ammo_ = ammo
  }

  _Initialize() {
    // Entity manager ~ gère les différents entitées et class importée
    this.entityManager_ = new entity_manager.EntityManager();
    this.OnGameStarted_();
  }

  OnGameStarted_() {
   
    this.LoadControllers_();
    // Stuck mouse in canvas
    document.body.requestPointerLock();

    this.previousRAF_ = null;
    this.RAF_();
  }

  LoadControllers_() {
    // Create ThreeJs part
    const threejs = new entity.Entity();
    threejs.AddComponent(new threejs_component.ThreeJSController());
    this.entityManager_.Add(threejs, 'threejs'); 
    // Create AmmoJs part
    const ammojs = new entity.Entity();
    ammojs.AddComponent(new ammojs_component.AmmoJSController(this.ammo_));
    this.entityManager_.Add(ammojs, 'physics');
    // Setup
    this.ammojs_ = ammojs.GetComponent('AmmoJSController');
    this.scene_ = threejs.GetComponent('ThreeJSController').scene_;
    this.camera_ = threejs.GetComponent('ThreeJSController').camera_;
    this.threejs_ = threejs.GetComponent('ThreeJSController');

    // Create entity for loading function
    const l = new entity.Entity();
    l.AddComponent(new load_controller.LoadController());
    this.entityManager_.Add(l, 'loader');

    // Parametres : scene, cam... a tous les composants "enfants"
    const basicParams = {
      scene: this.scene_,
      camera: this.camera_,
    };

    // Entity
    const spawner = new entity.Entity();
    this.entityManager_.Add(spawner, 'spawners');
    // Create map
    spawner.AddComponent(new map_builder.Build(basicParams));
    // Zombie part (spawn, round...)
    spawner.AddComponent(new zombies_spawn.ZombiesSpawn(basicParams));
    
    // Wait to spawn player
    const intervalLoop_ = setInterval(() => {
      this.spawnFunction(spawner, basicParams, intervalLoop_);
    }, 1000);

  }
  // Spawn player when map ready
  spawnFunction(spawner, basicParams, intervalLoop_) {
    if(basicParams.scene.userData.mapReady) {
      spawner.AddComponent(new player.SetUp(basicParams));
      spawner.GetComponent('SetUp').Spawn();
      // Stop interval
      clearInterval(intervalLoop_);
    }
  }

  RAF_() {
    requestAnimationFrame((t) => {
      // Démarre le rendu si début, sinon continue
      if (this.previousRAF_ === null) {
        this.previousRAF_ = t;
      } else {
        this.Step_(t - this.previousRAF_);
        this.previousRAF_ = t;
      }
      // Lance le rendu en boucle
      setTimeout(() => {
        this.RAF_();
      }, 1);
    });
  }

  Step_(timeElapsed) {
    const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001);

    this.entityManager_.Update(timeElapsedS);
    // Update AmmoJs part & ThreeJs part 
    this.ammojs_.StepSimulation(timeElapsedS);
    this.threejs_.Render(timeElapsedS);
  }
}


