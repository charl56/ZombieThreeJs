import * as THREE from 'three';

import {entity} from '../entities/entity.js';
import {basic_rigid_body} from '../basic-rigid-body.js';
import {sceneItems} from '../../../../static/datas/Maps/Map_Zombie_Ville'

export const map_builder = (() => {

  // Create map with building, road...
  class Build extends entity.Component {
    constructor(params) {
      super();

      this.params_ = params;
      this.spawned_ = false;
    }


    async BuildMap_() {
      // Var to check when map is ready
      this.params_.scene.userData.mapReady = false
      // Ajout des items pour faire la map, du fichier sceneItems.js
      const keys = Object.keys(sceneItems);
      // Pour chaques items
      for (const element of keys) {
           const key = element;
           const sceneItem = sceneItems[key];
           try {
               // ------ THREEJS SECTION
               // Loader entity
              const loader = this.FindEntity('loader').GetComponent('LoadController');
              const materialItem = await loader.loadMTL(sceneItem.mtl);
              await materialItem.preload();

              const materielMesh = await loader.loadOBJ(sceneItem.obj, materialItem);
              // Ombre de l'objet
              materielMesh.receiveShadow = true
              materielMesh.castShadow = true
              // Position
              materielMesh.position.set(
                  sceneItem.position.x,
                  sceneItem.position.y,
                  sceneItem.position.z
              );
              // Rotation
               materielMesh.rotation.set(
                   sceneItem.rotation.x,
                   sceneItem.rotation.y,
                   sceneItem.rotation.z,
               )
               // Echelle
               materielMesh.scale.set(sceneItem.scale_threejs, sceneItem.scale_threejs, sceneItem.scale_threejs);
               // Ajout d'un tag pour différencier
               materielMesh.userData.tag = "sceneItem"
               // Ajout de la mesh à l'objet de l'item
               sceneItem.mesh = materielMesh;

              // Physics part
              const e = new entity.Entity();
              // Partie AmmoJs
              e.AddComponent(new basic_rigid_body.BasicRigidBody({
                // scene: this.params_.scene,
                box: new THREE.Vector3(
                  sceneItem.scale_physic.x, 
                  sceneItem.scale_physic.y, 
                  sceneItem.scale_physic.z
                )
              }));
        
              this.Manager.Add(e, sceneItem);
              e.SetPosition(new THREE.Vector3(
                sceneItem.position.x,
                sceneItem.position.y,
                sceneItem.position.z
                ));
              e.SetActive(false);

              // Ajout à la scene
              this.params_.scene.add(materielMesh);
            
           } catch (error) {
               console.error("Erreur lors du chargement de la physique d'un élement", error, key);
           }
      }
      // Map ready
      this.params_.scene.userData.mapReady = true

      this.currentTime_ = 0.0;
    }

    Update(timeElapsed) {
      this.currentTime_ += timeElapsed;

      if (this.spawned_) {
        return;
      }

      this.spawned_ = true;
      
      // Principal floor
      const e = new entity.Entity();
      e.AddComponent(new basic_rigid_body.BasicRigidBody({box: new THREE.Vector3(100, 0.1, 100)}));
      this.Manager.Add(e);
      e.SetPosition(new THREE.Vector3(0,0,0));
      e.SetActive(false);

      this.BuildMap_();
    }
  };

  return {
    Build: Build,
  };

})();