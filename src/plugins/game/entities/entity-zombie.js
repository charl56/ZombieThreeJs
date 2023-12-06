import * as THREE from 'three';
import { entity } from './entity';
import {finite_state_machine} from '../map/finite-state-machine.js';
import {player_state} from '../map/player_control/player-state.js';


export const entity_zombie = (() => {

  const _M = new THREE.Matrix4();
  const _R = new THREE.Quaternion();
    
  class TargetFSM extends finite_state_machine.FiniteStateMachine {
    constructor(proxy) {
      super();
      this._proxy = proxy;
      this.Init_();
    }

    Init_() {
      this._AddState('idle', player_state.IdleState);
      this._AddState('loading', player_state.LoadingState);
      this._AddState('walk', player_state.WalkState);
      this._AddState('death', player_state.DeathState);
      this._AddState('attack_1', player_state.AttackState_1);
      this._AddState('attack_2', player_state.AttackState_2);
      this._AddState('recieveHit', player_state.HitState);

      
      // this._AddState('run', player_state.RunState);
    }
  };

  class TargetCharacterControllerProxy {
    constructor(animations) {
      this.animations_ = animations;
    }

    get animations() {
      return this.animations_;
    }
  };

  class TargetCharacterController extends entity.Component {
    constructor(params, zombieGltf) {
      super();
      this.params_ = params;
      this.zombieGltf_ = zombieGltf
    }

    InitEntity() {
      this.Init_();
    }

    Init_() {
      this.decceleration_ = new THREE.Vector3(-0.0005, -0.0001, -5.0);
      this.acceleration_ = new THREE.Vector3(1, 0.125, 100.0);
      this.velocity_ = new THREE.Vector3(0, 0, 0);
      this.group_ = new THREE.Group();

      this.params_.scene.add(this.group_);
      this.animations_ = {};
  
      this.Parent.Attributes.Render = {
        group: this.group_,
      };
      this.Parent.Attributes.NPC = true;
      this.LoadModels_();
    }

    InitComponent() {
      this.RegisterHandler_('health.death', (m) => { this.OnDeath_(m); });
      this.RegisterHandler_('health.update', (m) => { this.OnHit_(m); });
      this.RegisterHandler_('update.position', (m) => { this.OnUpdatePosition_(m); });
      this.RegisterHandler_('update.rotation', (m) => { this.OnUpdateRotation_(m); });
    }

    OnUpdatePosition_(msg) {
      this.group_.position.copy(msg.value);
    }

    OnUpdateRotation_(msg) {
      this.group_.quaternion.copy(msg.value);
    }

    OnDeath_(msg) {
      // Change animation
      this.stateMachine_.SetState('death');

      setTimeout(() => {
        // Get zombie list and index of zombie
        const zombie_manager = this.Parent.parent_.entities_.find((obj) => obj.Name == "spawners").components_.ZombiesSpawn.zombieManager_;
        const index_zombie = zombie_manager.findIndex((e) => e.Name === this.Parent.Name);
        // If zombie in list
        if(index_zombie != -1){
          // Delete This zomb in manager
          zombie_manager.splice(index_zombie, 1);
          // Remove from the scene
          this.params_.scene.remove(this.group_)

          
          //// !!!! Pas faire comme ça car si pas destroy, parti physique reste en collision et broadcast 
          //// !!!! Donc si pas destroy, bloque lors de la collision

          // // Delete entity
          // const index_entity = this.Parent.parent_.entities_.findIndex((e) => e.Name === this.Parent.Name);
          // this.Parent.parent_.entities_.splice(index_entity, 1);
          // // Delete in entitiesMap
          // if (this.Parent.Name in this.Parent.parent_.entitiesMap_) {
          //   delete this.Parent.parent_.entitiesMap_[this.Parent.Name];
          // }
          

        }
      }, 4000)
    
    }


    OnHit_(msg){
      this.stateMachine_.SetState('recieveHit');
    }

    async LoadModels_() {

      const loader = this.FindEntity('loader').GetComponent('LoadController');
      const gltf = await loader.loadGLTF(this.zombieGltf_.gltf);
      // Mesh
      this.target_ = gltf.scene

      this.group_.add(this.target_);
      this.target_.scale.setScalar(1);
      // Pos/Rot
      this.target_.position.set(0,-2,0);
      this.target_.rotateY(Math.PI);
      // Shadows
      this.target_.traverse(c => {
        c.castShadow = true;
        c.receiveShadow = true;
      });
      // Load animation
      this.mixer_ = new THREE.AnimationMixer(this.target_);
      const _FindAnim = (animName) => {
        for (let i = 0; i < gltf.animations.length; i++) {
          if (gltf.animations[i].name.includes(animName)) {
            const clip = gltf.animations[i];
            const action = this.mixer_.clipAction(clip);
            return {
              clip: clip,
              action: action
            }
          }
        }
        return null;
      };
      // Set animations
      this.animations_['loading'] = _FindAnim('Jump');
      this.animations_['idle'] = _FindAnim('SitDown');
      this.animations_['walk'] = _FindAnim('Walk');
      this.animations_['death'] = _FindAnim('Death');
      this.animations_['attack_1'] = _FindAnim('PickUp');
      this.animations_['attack_2'] = _FindAnim('Punch');
      this.animations_['recieveHit'] = _FindAnim('RecieveHit');      
      // this.animations_['run'] = _FindAnim('Run');

      this.stateMachine_ = new TargetFSM(
          new TargetCharacterControllerProxy(this.animations_));

      if (this.queuedState_) {
        this.stateMachine_.SetState(this.queuedState_)
        this.queuedState_ = null;
      } else {
        this.stateMachine_.SetState('loading');
      }
    }

    FindPlayer_() {
      const player = this.FindEntity('player');
      if(player === undefined) return;
      const dir = player.Position.clone();
      dir.sub(this.Parent.Position);
      dir.y = 0;

      return dir;
    }

    UpdateAI_(timeElapsedS) {
      // Distance to player
      const toPlayer = this.FindPlayer_();
      if(toPlayer === undefined) return;
      const dirToPlayer = toPlayer.clone().normalize();
      // State if to far of the player
      if (toPlayer.length() > 18) {
        this.stateMachine_.SetState('idle');
        this.Parent.Attributes.Physics.CharacterController.setWalkDirection(new THREE.Vector3(0, 0, 0));
        return;
      }

      _M.lookAt(
          new THREE.Vector3(0, 0, 0),
          dirToPlayer,
          new THREE.Vector3(0, 1, 0));
      _R.setFromRotationMatrix(_M);

      this.Parent.SetQuaternion(_R);



      // Walk on front of, rotate to the player
      const forwardVelocity = 1;
      const strafeVelocity = 0;
      
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(_R);
      forward.multiplyScalar(forwardVelocity * timeElapsedS * 2);
      
      const left = new THREE.Vector3(-1, 0, 0);
      left.applyQuaternion(_R);
      left.multiplyScalar(strafeVelocity * timeElapsedS * 2);
      
      const walk = forward.clone().add(left);
      this.Parent.Attributes.Physics.CharacterController.setWalkDirection(walk);
            
      if (toPlayer.length() < 3.5) {
        // Attack random
        const anim = Math.random() < 0.5 ? 'attack_1' : 'attack_2'
        this.stateMachine_.SetState(anim);
      } else {
        this.stateMachine_.SetState('walk');
      }
    }

    Update(timeInSeconds) {
      if (!this.stateMachine_) {
        return;
      }
      // console.log(this.Parent.Manager.entities_)

      const input = this.GetComponent('BasicCharacterControllerInput');
      this.stateMachine_.Update(timeInSeconds, input);
    
      if (this.mixer_) {
        this.mixer_.update(timeInSeconds);
      }


      // HARDCODED
      if (this.stateMachine_._currentState._action) {
        this.Broadcast({
          topic: 'player.action',
          action: this.stateMachine_._currentState.Name,
          time: this.stateMachine_._currentState._action.time,
        });
      }
      // Update state of zombie
      switch (this.stateMachine_.State) {
        case 'idle': {
          this.UpdateAI_(timeInSeconds);
          break;
        }
        case 'loading': {
          this.UpdateAI_(timeInSeconds);
          break;
        }
        case 'walk': {
          this.UpdateAI_(timeInSeconds);
          break;
        }
        case 'attack_1': {
          this.UpdateAI_(timeInSeconds);
          break;
        }
        case 'attack_2': {
          this.UpdateAI_(timeInSeconds);
          break;
        }
        case 'recieveHit': {
          this.UpdateAI_(timeInSeconds);
          break;
        }
        case 'death': {
          this.Parent.Attributes.Physics.CharacterController.setWalkDirection(new THREE.Vector3(0, 0, 0));
          break;
        }
      }
      
      const t = this.Parent.Attributes.Physics.CharacterController.body_.getWorldTransform();
      const pos = t.getOrigin();
      const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());

      this.Parent.SetPosition(pos3);
    }
  };
    
  return {
      TargetFSM: TargetFSM,
      TargetCharacterController: TargetCharacterController,
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