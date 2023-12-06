import * as THREE from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';      // Pour les objets

import {entity} from '../../entities/entity.js';

import {weapons} from '../../../../../static/datas/weapons.js'
import {render_component} from '../../render-component.js';
import {passes} from '../../passes.js';
import {math} from '../../math.js';
import { h } from 'vue';


export const gun_controller = (() => {

  let DEFAULT_COOLDOWN = 0.1;
  let DEFAULT_LOAD_TIMER = 2;

  function ExpImpulse(x, k) {
    const h = k * x;
    return h * Math.exp(1.0 - h);
  }

  class GunController extends entity.Component {
    constructor(params) {
      super();

      this.group_ = new THREE.Group();
      this.soundGroup_ = new THREE.Group();
      this.decals_ = new THREE.Group();
      this.params_ = params;
      this.params_.scene.add(this.decals_);
      this.params_.scene.add(this.soundGroup_);
      this.lastStep_ = 0.0;
      this.cooldown_ = 0.0;
      this.aim_ = false;
      this.bullets_ = 0;
      this.magazine_ = 0;
      this.nbMagazine_ = 0;
      this.loadTimer_ = 0;
      this.weaponName_ = '';
      this.damage_ = 0;
    }

    Destroy() {
      this.group_.traverse(c => {
        if (c.material) {
          c.material.dispose();
        }
        if (c.geometry) {
          c.geometry.dispose();
        }
      });
      this.group_.parent.remove(this.group_);
    }

    InitComponent() {
      this.RegisterHandler_('render.visible', (m) => { this.OnVisible_(m); });
      this.RegisterHandler_('fps.step', (m) => { this.OnStep_(m); });
      this.SetPass(passes.GUN);
    }

    LoadSound_(soundName) {
      const threejs = this.FindEntity('threejs').GetComponent('ThreeJSController');
      const sound1 = new THREE.PositionalAudio(threejs.listener_);

      this.soundGroup_.add(sound1);

      const loader = new THREE.AudioLoader();
      loader.load('./static/Sounds/Fond/' + soundName, (buffer) => {
        sound1.setBuffer(buffer);
        sound1.setLoop(false);
        sound1.setVolume(1.0);
        sound1.setRefDistance(1);
        sound1.play();
      });
    }

    InitEntity() {
      this.ChangeWeapon('pistolSilencer')
    }

    ChangeWeapon(name){
      const weapon = weapons[name]
      const e = new entity.Entity();

      e.AddComponent(new render_component.RenderWeapon({
        scene: this.Parent.Attributes.FPSCamera.group,
        obj: weapon.obj,
        mtl: weapon.mtl,
        scale: new THREE.Vector3(5, 5, 5),
        emissive: new THREE.Color(0x000000),
        color: new THREE.Color(0xFFFFFF),
      }));
      this.Manager.Add(e);
      e.SetPosition(new THREE.Vector3(0.1, -0.25, -0.1));
      e.SetActive(false);

      // Parameters
      this.gun_ = e;
      DEFAULT_COOLDOWN = weapon.parameters.shootTimer;
      DEFAULT_LOAD_TIMER = weapon.parameters.loadTimer;
      this.magazine_ = weapon.parameters.remainBullets;
      this.bullets_ = weapon.parameters.loader;
      this.nbMagazine_ = weapon.parameters.remainLoaders; 
      this.weaponName_ = name;
      this.damage_ = weapon.parameters.damage
      // Set 
      const data = {"bullet": this.bullets_, "magazine": this.magazine_, "nbMagazine": this.nbMagazine_, "name": this.weaponName_, "loadTimer": this.loadTimer_}
      this.FindEntity('player').GetComponent('Displays').UpdateBullets_(data);

      // Gun Rota
      const q1 = new THREE.Quaternion();
      q1.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);     // Axe Y, 180 deg rotation
      this.gun_.SetQuaternion(q1);
      // Gauche/Droite, Haut/Bas, Devant/Derrière
      const v1 = new THREE.Vector3(0.09,-0.16,-0.25 )
      this.gun_.SetPosition(v1);
      
    }

    OnVisible_(m) {
      this.group_.visible = m.value;
    }

    OnStep_() {
      if (this.lastStep_ <= 0) {
        this.lastStep_ = 0.25;
        if (this.Parent.Attributes.Physics.CharacterController.onGround()) {
          this.LoadSound_('footstep.ogg');
        }
      }
    }

    UpdateGunRecoil_() {
      const q1 = new THREE.Quaternion();
      q1.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);     // Axe Y, 180 deg rotation

      const q2 = new THREE.Quaternion(); // DG
      q2.setFromAxisAngle(new THREE.Vector3(0, 0, 0.3), Math.PI);

      const t = ExpImpulse(math.sat(1.0 - this.cooldown_ / DEFAULT_COOLDOWN), 10.0);
      q1.slerp(q2, t);
      this.gun_.SetQuaternion(q1);
    }

    UpdateAiming_(input){
      const camera = this.Parent.parent_.entities_.find((obj) => obj.Name == "threejs").components_.ThreeJSController.camera_;

      if(input.current_.rightButton){
        camera.fov = 90
      } else {
        camera.fov = 45
      }
    }

    Update(timeElapsedS) {
      this.soundGroup_.position.copy(this.Parent.Position);
      this.lastStep_ -= timeElapsedS;

      const input = this.GetComponent('PlayerInput');
      if (!input.isReady()) {
        return;
      }
      
      this.cooldown_ -= timeElapsedS;
      this.loadTimer_ -= timeElapsedS;
      // this.UpdateAiming_(input);  // Update : aim or not
      this.UpdateGunRecoil_();    // Recoil at fire

      // Don't shot firing rate or weapon not load with bullets
      if (this.cooldown_ > 0.0 || this.loadTimer_ > 0.0) {
        return;
      }

      
      // VIDEO HACK
      const fired = input.mouseLeftReleased();
      if (fired) {
        if(this.bullets_ == 0 && this.nbMagazine_ == 0){
          return
        }
        this.bullets_ --
        // Bullets and magazines
        if(this.bullets_ == 0 && this.nbMagazine_ > 0){
          this.nbMagazine_ --
          this.bullets_ = this.magazine_
          this.loadTimer_ = DEFAULT_LOAD_TIMER
        } 

        // Update bullets display
        const data = {"bullet": this.bullets_, "magazine": this.magazine_, "nbMagazine": this.nbMagazine_, "name": this.weaponName_, "loadTimer": this.loadTimer_}
        this.FindEntity('player').GetComponent('Displays').UpdateBullets_(data);

        // Shoot sound
        // this.LoadSound_('Suuu.mp3');
        // Firing rate
        this.cooldown_ = DEFAULT_COOLDOWN;

        const physics = this.FindEntity('physics').GetComponent('AmmoJSController');
        const end = this.Parent.Forward.clone();
        end.multiplyScalar(100);
        // VIDEO: THIS WAS BROKEN
        // I forgot to add the parent position to the forward vector, so all the shots were
        // offset
        end.add(this.Parent.Position);


        const offset = new THREE.Vector3(0.1, -0.125, -0.75);

        const blaster = this.FindEntity('fx').GetComponent('BlasterSystem');
        const tracer = blaster.CreateParticle();
        // tracer.Start = this.Parent.Position.clone();
        // tracer.End.add(this.Parent.Position);
        // tracer.Velocity = this.Parent.Forward.clone();
        tracer.Start = offset.clone();
        tracer.Start.applyQuaternion(this.Parent.Quaternion);
        tracer.Start.add(this.Parent.Position);
        tracer.End = this.Parent.Forward.clone();
        tracer.End.multiplyScalar(10.0);
        tracer.End.add(this.Parent.Position);

        tracer.Velocity = tracer.End.clone();
        tracer.Velocity.sub(tracer.Start);
        tracer.Velocity.normalize();
        tracer.Velocity.multiplyScalar(75.0);
        tracer.Colours = [new THREE.Color(0xd19119), new THREE.Color(0xd19119)];
        tracer.Length = 10.0;
        tracer.Life = 1.0;
        tracer.TotalLife = 1.0;
        tracer.Width = 0.05;

        const hits = physics.RayTest(this.Parent.Position, end);

        if (hits.length == 0) {
          return;
        }

        for (let i = 0; i < hits.length; ++i) {
          const mesh = this.FindEntity(hits[i].name);

          if (mesh.Attributes.NPC) {
            if (mesh.Attributes.Stats.health > 0) {
              mesh.Broadcast({topic: 'shot.hit', damage: this.damage_, position: hits[i].position, start: this.Parent.Position, end: end});
            }
            continue;
          } else {
            return  // If obstacl, can't touch zombie behind 
          }
      
          // mesh.Attributes.Render.group.traverse(c => {
          //   if (c.geometry) {
          //     if (0) {
          //       const position = hits[i].position.clone();
  
          //       const rotationZ = new THREE.Quaternion();
          //       rotationZ.setFromAxisAngle(new THREE.Vector3(0, 0, -1), Math.PI * Math.random());
          //       const rotation = this.Parent.Quaternion.clone();
          //       rotation.multiply(rotationZ);
          //       const euler = new THREE.Euler();
          //       euler.setFromQuaternion(rotation);
    
          //       const decalScale = 0.2;
          //       const m = new THREE.Mesh(
          //           new DecalGeometry(c, position, euler, new THREE.Vector3(decalScale, decalScale, decalScale) ), decalMaterial);
          //       this.decals_.add(m);
          //     }
  
          //     if (0) {
          //       {
          //         const geometry = new THREE.SphereGeometry( 0.25, 16, 16 );
          //         const material = new THREE.MeshBasicMaterial( { color: 0x00FF00 } );
          //         const sphere = new THREE.Mesh( geometry, material );
          //         sphere.position.copy(hits[i].position);
          //         this.params_.scene.add( sphere );  
          //       }

          //       const material = new THREE.LineBasicMaterial({
          //         color: 0xFF0000,
          //         linewidth: 5,
          //       });
                
          //       const points = [tracer.Start, hits[i].position];
                
          //       const geometry = new THREE.BufferGeometry().setFromPoints( points );
                
          //       const line = new THREE.Line( geometry, material );
          //       this.params_.scene.add( line );
          //     }

          //     // VIDEO HACK
          //     if (1) {
          //       const position = hits[i].position.clone();
          //       const eye = position.clone();
          //       eye.add(hits[i].normal);
  
          //       const rotationZ = new THREE.Matrix4();
          //       rotationZ.makeRotationZ(Math.PI * Math.random());
          //       const rotation = new THREE.Matrix4();
          //       rotation.lookAt(eye, position, THREE.Object3D.DefaultUp);
          //       rotation.multiply(rotationZ);
          //       const euler = new THREE.Euler();
          //       euler.setFromRotationMatrix(rotation);
  
          //       console.log('pos: ' + position.y);
  
          //       const decalMaterial = new THREE.MeshStandardMaterial( {
          //         color: 0xFFFFFF,
          //         // map: textureLoader.load('./resources/textures/bullet-albedo.png'),
          //         // normalMap: textureLoader.load('./resources/textures/bullet2-normal.jpg'),
          //         // normalScale: new THREE.Vector2(1, -1),
          //         transparent: true,
          //         depthTest: true,
          //         depthWrite: false,
          //         polygonOffset: true,
          //         polygonOffsetFactor: -4,
          //         roughness: 0.1,
          //         metalness: 0.1,
          //       });
          //       // decalMaterial.map.wrapS = THREE.RepeatWrapping;
          //       // decalMaterial.map.wrapT = THREE.RepeatWrapping;
          //       // decalMaterial.map.encoding = THREE.sRGBEncoding;
  
          //       decalMaterial.customProgramCacheKey = () => {
          //         return 'decalMaterial';
          //       };
                
          //       const decalScale = 10.0;
          //       const m = new THREE.Mesh(
          //           new DecalGeometry(c, position, euler, new THREE.Vector3(decalScale, decalScale, decalScale * 2) ), decalMaterial);
          //       m.receiveShadow = true;
          //       this.decals_.add(m);  
          //     }
  
          //   }
          // });
          // return;
        }
      }
    }

  };

  return {
    GunController: GunController
  };

})();