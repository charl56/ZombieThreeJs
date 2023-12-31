import * as THREE from 'three';

import {entity} from '../entities/entity.js';

import {player_input} from './player_control/player-input.js';
import {first_person_camera} from './player_control/first-person-camera.js';
import {kinematic_character_controller} from './player_control/kinematic-character-controller.js';
import {gun_controller} from './player_control/gun-controller.js';
import {display} from '../fx/display.js'
// Menu pause
import {pause_menu} from './menu-pause.js';

export const player = (() => {

  class SetUp extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
    }

    Spawn(){
      const e = new entity.Entity();
      
      e.SetPosition(new THREE.Vector3(0, 10, 0));
      e.AddComponent(new player_input.PlayerInput(this.params_));                                       // Input player (move, shoot, jump, pause...)
      e.AddComponent(new first_person_camera.FirstPersonCamera(this.params_));                          // Move camera on player
      e.AddComponent(new kinematic_character_controller.KinematicCharacterController(this.params_));    // Set "physical body" to player
      e.AddComponent(new gun_controller.GunController(this.params_))                                    // Read the name
      e.AddComponent(new display.Displays(this.params));                                                // Crosshair
      e.AddComponent(new pause_menu.PauseMenu(this.params));                                            // Open/close menu : stop/play game

      this.Manager.Add(e, 'player');
      return e
    }
  };
 
  return {
    SetUp: SetUp,
  };
})();