import {entity} from '../entities/entity.js';
import {player_input} from '../map/player_control/player-input.js';


export const display = (() => {


  class Displays extends entity.Component {
    constructor(params) {
      super();
      this.params_ = params;
      this.Init_();
      this.previousRound_ = 0;
      this.weaponLoaded_ = false;
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
        this.bulletInMagazine_ = document.getElementById('bullet-in-magazine');
        this.bulletAllMagazines_ = document.getElementById('bullet-all-magazines');
        this.weaponName_ = document.getElementById('weapon-name');
        this.progressLinearBullet_ = document.getElementById('progress-linear-bullet');
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
      if(this.previousRound_ == round){
        return
      }
      this.previousRound_ = round;
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
      if(data.bullet < (data.magazine/4)){
        this.progressLinearBullet_.children[1].style.backgroundColor = "red";   // Color of progress bar
        this.bulletInMagazine_.style.color = "red";                             // Color of bulle nb  
        this.bulletInMagazine_.innerText = data.bullet;                         // Nb of bullet
      } else {
        this.progressLinearBullet_.children[1].style.backgroundColor = "white";
        this.bulletInMagazine_.style.color = "white";
        this.bulletInMagazine_.innerText = data.bullet;
      }

      if(data.nbMagazine < 2){
        this.bulletAllMagazines_.style.color = "red";
      } else {
        this.bulletAllMagazines_.style.color = "white";
      }

      this.bulletAllMagazines_.innerText = data.magazine * data.nbMagazine;     // Bullets in all magazines
      this.weaponName_.innerText = data.name;                                   // Weapon name

      if(data.bullet == data.magazine && !this.weaponLoaded_){
          this.weaponLoaded_ = true
          let loaderValue = 0                    // Valeur chargement à 0
          let wait = (data.loadTimer * 100)         // Divise le temps de chargement par 100, pour le loader (valeur de 0-100 )
          let loadInterval = setInterval(() => {                     // Incrément de 1 tous les loadTimer/100
            loaderValue += 10
            this.progressLinearBullet_.children[1].style.width = loaderValue + "%"  
              if(loaderValue == 100){         // Quand chargrment finis
                  clearInterval(loadInterval);        // On arrête la boucle 
              }
          }, wait)      
      } else {
        this.weaponLoaded_ = false
        this.progressLinearBullet_.children[1].style.width = parseInt((data.bullet/data.magazine) * 100) + "%"
      }
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