import * as THREE from 'three';

import {entity} from '../entities/entity.js';
import {player_input} from '../map/player_control/player-input.js';


export const pause_menu = (() => {

  // Spawn the zombies
  class PauseMenu extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
      this.gamePause_ = false;
      this.previousButton_ = false;
      this.currentButton_ = false;
    }

    InitComponent(){
    }

    setGamePause_(){
      console.log(this);
      document.exitPointerLock();
    }

    setGamePlay_(){
      document.body.requestPointerLock();

    }


    updatePauseMenu_(){
      // Check if player_input ready
      const input = this.GetComponent('PlayerInput');
      if(!input.isReady()){
        return;
      }
      // Pause/play if 'p' pressed
      this.currentButton_ = input.pauseMenuReleased();
      if(this.previousButton_ && !this.currentButton_){
        this.gamePause_ = !this.gamePause_;
        if(this.gamePause_){
          this.setGamePause_()
        } else {
          this.setGamePlay_()
        }
      }

      this.previousButton_ = this.currentButton_;
    }


    Update(timeElapsed) {
      this.updatePauseMenu_();
    }
  }


  return {
    PauseMenu: PauseMenu,
  };

})();