import * as THREE from 'three';
import { entity } from './entity';

export const entity_zombie = (() => {

const _M = new THREE.Matrix4();
const _R = new THREE.Quaternion();

  // Class for 1 zombie
  class Zombie extends entity.Component {
    
    constructor(params, acutalSpawn, zombieGltf) {   
      super();    // Because extends entity.Component

      this.params_ = params;
      this.zombieGltf_ = zombieGltf;
      this.name_ = null;
      this.id_ = null;
      this.display_ = {};
      this.physic_ = null;
      this.components_ = {};
      this.attributes_ = {};
      // Animations
      this.mixer_ = null;
      this.animations_ = [];
      this.actualAnimation_ = null

      this._position = new THREE.Vector3();
      this._position.copy(acutalSpawn);
      this._rotation = new THREE.Quaternion();
      this._translation = new THREE.Vector3(0, 2, 0);
      this.handlers_ = {};
      this.parent_ = null;
      this.dead_ = true;
    }

    async InitEntity(){
      // Set zombie spawn
      let scale = {x: 1, y: 1, z: 1};
      // Get gltf file
      const loader = this.FindEntity('loader').GetComponent('LoadController');
      const gltf = await loader.loadGLTF(this.zombieGltf_.gltf);
      this.animations_ = gltf.animations
      // Equivalent mesh
      const zombie = gltf.scene
      // Ombre de l'objet
      zombie.castShadow = true;
      zombie.receiveShadow = true
      // Position
      zombie.position.copy(this._position)
      zombie.scale.set(scale.x, scale.y, scale.z)
      // Ajout d'un tag pour différencier
      zombie.userData.tag = "target-zombie"
      // Ajout à la scene
      this.params_.scene.add(zombie)

      this.components_["zombie"] = zombie;

      this.mixer_ = this.SetActualAnimation("Jump")      
      this.dead_ = false
    }


    Update(timeElapsed){
      if(this.dead_) {
        return
      }
   
      console.log(this.Parent)
      // Updates functions
      this.updateRotation_(timeElapsed)
      this.updateTranslation_(timeElapsed)
      this.updateAnimation_(timeElapsed)

      // Set value updated
      this.components_['zombie'].quaternion.copy(this._rotation)
      this.components_['zombie'].position.copy(this._position)
      

    }

    updateRotation_(timeElapsed){
      // Rotation zombie
      const toPlayer = this.FindPlayer_()
      if(toPlayer != undefined){
        const dirToPlayer = toPlayer.clone().normalize();

        _M.lookAt(
          dirToPlayer,
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 1, 0));
        _R.setFromRotationMatrix(_M);
        
        this._rotation.copy(_R)
      }


      // console.log(this)
      // zombie.physic_.SetQuaternion(_R);
      
      // zombie.display_.quaternion.copy(zombie.physic_._rotation)
    }
    updateTranslation_(timeElapsed){
      const stateMachine = {
        "closeToPlayer": () => {
          return new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1)
        },
      
        "farFromPlayer": () => {
          return new THREE.Vector3(0,0,0)  
        },
      
        "defaultState": () => {
          const forwardVelocity = 1;
          const strafeVelocity = 0;
    
          const forward = new THREE.Vector3(0, 0, -1);
          forward.applyQuaternion(_R);
          forward.multiplyScalar(forwardVelocity * timeElapsed * 2);
      
          const left = new THREE.Vector3(-1, 0, 0);
          left.applyQuaternion(_R);
          left.multiplyScalar(strafeVelocity * timeElapsed * 2);
          return forward.clone().add(left);
        },
      };
      // Don't move if player not on map
      const player = this.FindEntity('player');
      if (player === undefined) return; // Sortie anticipée si player est undefined

      let walk = new THREE.Vector3(0,0,0)  
    
      // If far, zomb doesn't move
      const toPlayer = this.FindPlayer_()
      if (toPlayer.length() > 15) {
        walk = stateMachine["farFromPlayer"]()
      }
      // else if(toPlayer.length() < 1){
      //   walk = stateMachine["closeToPlayer"]()
      // }
      else {
        walk = stateMachine["defaultState"]()
      }

      this.Parent.Attributes.Physics.CharacterController.setWalkDirection(walk);
      const t = this.Parent.Attributes.Physics.CharacterController.body_.getWorldTransform();
      const pos = t.getOrigin();
      const pos3 = new THREE.Vector3(-pos.x(), 0, -pos.z());
      
      this._translation.lerp(pos3, 0.25);

      this.Parent._position.copy(this._translation)
      this._position.copy(this.Parent._position)

 
    }

    updateAnimation_(timeElapsed){
      const stateMachine = {
        "closeToPlayer": () => {
          if (this.actualAnimation_ == 'SwordSlash' || this.actualAnimation_ == 'Punch') {
            return;
          }
      
          if (Math.random() < 0.5 && this.actualAnimation_ != 'SwordSlash') {
            this.mixer_ = this.SetActualAnimation('SwordSlash');
          } else if (this.actualAnimation_ != 'Punch') {
            this.mixer_ = this.SetActualAnimation('Punch');
          }
        },
      
        "farFromPlayer": () => {
          if (this.actualAnimation_ != 'SitDown') {
            this.mixer_ = this.SetActualAnimation('SitDown');
          }
        },
      
        "defaultState": () => {
          if (this.actualAnimation_ != 'Walk') {
            this.mixer_ = this.SetActualAnimation('Walk');
          }
        },
      };

      const toPlayer = this.FindPlayer_()
      if(toPlayer != undefined){
        if (toPlayer.length() < 3) {
          stateMachine["closeToPlayer"]();
        } else if (toPlayer.length() > 15) {
          stateMachine["farFromPlayer"]();
        } else {
          stateMachine["defaultState"]();
        }  
      }
      this.mixer_ != null ? this.mixer_.update(timeElapsed/2) : false
    }


    
    FindPlayer_() {
      const player = this.FindEntity('player');
      if (player === undefined) return; // Sortie anticipée si player est undefined
      
      const dir = player._position.clone();
      dir.sub(this._position);
      dir.y = 0;  

      return dir;
    }
    AddComponent(c) {
      c.SetParent(this);
      
      if (!this.components_[c.constructor.name]) {
        this.components_[c.constructor.name] = c;
      }
      
      c.InitEntity();
    }
    SetActualAnimation(name){
      this.actualAnimation_ = name
      let mixer = new THREE.AnimationMixer(this.components_["zombie"])    // Animation on this zombie
      const clip = THREE.AnimationClip.findByName(this.animations_, name) // Choose animation 'name' in animations_ list
      let action = (mixer.clipAction(clip))
      action.play()
      return mixer

    }
    Destroy() {
      for (let k in this.display_) {
        this.display_[k].Destroy();
      }
      this.display_ = null;
      this.parent_ = null;
      this.handlers_ = null;
    }
    SetName(n) {
      this.name_ = n;
    }
    SetId(n) {
      this.id_ = n;
    }
    SetParent(p) {
      this.parent_ = p;
    }
    SetAnimations(m){
      this.animations_ = m
    }

  };

 // Class for all zombies
 class ZombieManager {
  constructor() {
    this.ids_ = 0;
    this.entitiesMap_ = {};
    this.entities_ = [];
  }

  Destroy() {
      this.entities_ = []
  }

  AddToList(e, n){
    
    this.ids_ += 1;
    
    this.entitiesMap_[n] = e;
    this.entities_.push(e);

    e.SetParent(this);
    e.SetName(n);
    e.SetId(this.ids_);
    e.InitEntity();
  }

  GetList(){
    return this.entities_
  }

  InitComponent() {}
  
  InitEntity() {}

};



  return {
      Zombie: Zombie,
      ZombieManager: ZombieManager,
    };

})();



/* List of animations : 
* Death
* Defeat
* Idle
* Jump
* PickUp
* Punch
* RecieveHit
* Roll
* Run
* Run_Carry
* Shoot_OneHanded
* SitDown
* StandUp
* SwordSlash
* Victory
* Walk
* Walk_Carry
*/