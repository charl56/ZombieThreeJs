import {entity} from '../entities/entity.js';
import {player_input} from '../map/player_control/player-input.js';


export const display = (() => {


  class Displays extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
      this.Init_();
      this.previosRound_ = 0;
    }

    Init_() {
        // Crosshair
        this.sight_ = document.getElementById('sight');
        // Round
        this.rounds_ = document.getElementById('rounds');
        this.roundU_ = document.getElementById('round-img-u').children[1];
        this.roundD_ = document.getElementById('round-img-d').children[1];
        // Bullets
        this.bullets_ = document.getElementById('bullets');
        this.bulletInMagazine = document.getElementById('bullet-in-magazine');
        this.bulletAllMagazines = document.getElementById('bullet-all-magazines');
        this.weaponName = document.getElementById('weapon-name');
    }

    SeparateDigits(number) {
      const numberString = number.toString();
      const digitsArray = [];
    
      for (let i = 0; i < numberString.length; i++) {
        digitsArray.push(parseInt(numberString[i], 10));
      }
    
      return digitsArray;
    }


    UpdateSight_(){   // Update crosshair when moving
        const input = this.GetComponent('PlayerInput');
        // If player move
        if(input.key(player_input.KEYS.z) || input.key(player_input.KEYS.q) ||input.key(player_input.KEYS.s) || input.key(player_input.KEYS.d)){
            this.sight_.style.scale = 1.5;
        } else {
            this.sight_.style.scale = 1;
        }
    }

    UpdateRound_(){   // Update round
      // Get round number
      const round = this.Parent.parent_.entities_.find((obj) => obj.Name == "spawners").components_.ZombiesSpawn.round_;
      if(this.previosRound_ == round){
        return
      }
      this.previosRound_ = round;
      const tabRound = this.SeparateDigits(round)
      // Set display
      if(round < 10){
        if(import.meta.env.DEV){
          this.roundD_.setAttribute('src', new URL('../../../../static/Game/Round_'+tabRound[0]+'.png', import.meta.url).href);
        } else {
          this.roundD_.setAttribute('src', './static/Game/Round_'+tabRound[0]+'.png');
        }
      } else {
        if(import.meta.env.DEV){
            this.roundD_.setAttribute('src', new URL('../../../../static/Game/Round_'+tabRound[0]+'.png', import.meta.url).href);
            this.roundU_.setAttribute('src', new URL('../../../../static/Game/Round_'+tabRound[1]+'.png', import.meta.url).href);
          } else {
            this.roundD_.setAttribute('src', './static/Game/Round_'+tabRound[0]+'.png');
            this.roundU_.setAttribute('src', './static/Game/Round_'+tabRound[1]+'.png');
          }
      }     
    }

    UpdateBullets_(data){
      this.bulletInMagazine.innerText = data.bullet;
      this.bulletAllMagazines.innerText = data.magazine * data.nbMagazine;
      this.weaponName.innerText = data.name; 
    }


    Update(timeInSeconds) {
        // // Check if player on map
        const player = this.FindEntity('player');
        if(player === undefined) return;

        this.sight_.style.visibility = "visible";
        this.rounds_.style.visibility = "visible";
        this.bullets_.style.visibility = "visible";
        this.UpdateSight_();
        this.UpdateRound_();
    }
  };



  return {
    Displays: Displays,
  };
})();