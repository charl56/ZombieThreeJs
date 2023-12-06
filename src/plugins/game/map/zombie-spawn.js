import * as THREE from 'three';

import {entity} from '../entities/entity.js';
import {entity_zombie} from '../entities/entity-zombie.js'

import {basic_rigid_body} from '../basic-rigid-body.js';
import {kinematic_character_controller} from './player_control/kinematic-character-controller.js'
import { health_component } from './player_control/health-component.js';

import {spawnsCoord} from '../../../../static/datas/Maps/Map_Zombie_Ville'
import targetItems from '../../../../static/datas/targetItems'

export const zombies_spawn = (() => {

  // Spawn the zombies
  class ZombiesSpawn extends entity.Component {
    constructor(params) {
      super();

      this.params_ = params;
      this.params_.box = new THREE.Vector3(0.8, 2, 0.8)
      this.zombieManager_ = [] // Get list of zombies
      this.spawning_ = false  // Zombien spawning ?
      this.round_ = 0;        // Round
      this.zombies_ = [];
    }

    InitComponent(){
    }
    

    async SetSpawns_() {

        this.spawning_ = true
        this.round_ += 1
        // Var to check when zombies are ready
        this.params_.scene.userData.zombiesReady = false
        // Zombies data
        const zombieGltf = targetItems["zombieMale"]
        // Set zombie, depend of round
        let zombieNumber_ = (this.round_ * 1.41) + 2.6
        let zombieLife_ = this.round_ * 10
        // Get zombies
        this.zombieManager_ = []
        // For number of zombie per round
        for (let i = 0; i<parseInt(zombieNumber_); i++) {
            try {
                // Random spawn, in a list of spawn available
                let keyLength = Object.keys(spawnsCoord).length
                let keySpawn = parseInt(Math.random() * keyLength) + 1
                let acutalSpawn = spawnsCoord[keySpawn] 
                
                const zombie = new entity.Entity();
                zombie.AddComponent(new entity_zombie.TargetCharacterController(this.params_, zombieGltf));
                zombie.AddComponent(new kinematic_character_controller.KinematicCharacterController(this.params_));
                zombie.AddComponent(new health_component.HealthComponent({health: zombieLife_, maxHealth: zombieLife_}));
                // zombie.AddComponent(new basic_rigid_body.CharacterRigidBody(this.params_));
                
                this.Manager.Add(zombie, 'zombie_'+i);
                zombie.SetPosition(new THREE.Vector3(acutalSpawn.x, acutalSpawn.y, acutalSpawn.z));        // Position hitbox zombie
                zombie.SetActive(true)
                // List
                this.zombieManager_.push(zombie);    // List of zombies

              } catch (error) {
                console.error("Erreur lors du chargement de la physique d'un élement", error);
            }
        }
        // Zombies ready
        this.params_.scene.userData.zombiesReady = true
        this.spawning_ = false
        this.currentTime_ = 0.0;
    }

    Update(timeElapsed) {

      this.currentTime_ += timeElapsed;
      // If zombie on map, or in spawning, exit function
      if(this.zombieManager_.length > 0 || this.spawning_){
        return;
      }

      // If no zombie, spawn them !
      this.SetSpawns_();
    }

 
  }


  return {
    ZombiesSpawn: ZombiesSpawn,
  };

})();