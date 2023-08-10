<template>
        <div class="scene" ref="scene" onselectstart="return false" onmousedown="return false">
            <div class="viseur d-flex align-center justify-center">
                <div>
                    <v-img class="icon-viseur" :src="viseur"></v-img>
                </div>
            </div>
            <!-- Affiche le score -->
            <displayScore class="display-component" :score="score" />
            <!-- Affiche les balles restantes -->
            <displayLoader class="display-component" :remainBullets="remainBullets" :loader="loader" :remainLoaders="remainLoaders" :loadTimer="weapons[this.player.weapon].parameters.loadTimer" />
            <!-- Affiche le nombre de round -->
            <displayRound />
            <!-- Affiche le menu de pause -->
            <displayMenu />
            <!-- Affiche phrase quand on passe prêt d'une arme à acheter -->
            <displayWeaponBuy />
        </div>
</template>

<script>
    // ThreeJs
    import * as THREE from 'three';
    import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';      // Pour les objets
    import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';      // //
    import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'     // Image 360
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';    // Pour les animation
    // Plugins
    import { eventBus } from '../../plugins/eventBus'
    import '../../plugins/ammo'
    // Import datas
    import weapons from '../../../static/datas/weapons'
    import {sceneItems, spawnsCoord, weaponsCoord} from '../../../static/datas/Maps/Map_Zombie_Ville'
    import targetItems from '../../../static/datas/targetItems'
    import sounds from '../../../static/datas/sounds'
    // Components
    import displayScore from './displays/displayScore.vue';
    import displayLoader from './displays/displayLoader.vue';
    import displayRound from './displays/displayRound.vue';
    import displayMenu from './displays/displayMenu.vue'
    import displayWeaponBuy from './displays/displayWeaponBuy.vue'


    export default {
        components: {
            displayScore,
            displayLoader,
            displayRound,
            displayMenu,
            displayWeaponBuy,
        },
        created(){
            this.weapons = weapons
            // MAJ Score
            eventBus.on('scoreChange', (data) => {
                this.score = data
            });
            // MAJ balles restantes
            eventBus.on('remainBullets', (data) => {
                this.remainBullets = data[0]
                this.remainLoaders = data[1]
                this.loader = data[2]
            })
            // MAJ sound
            eventBus.on('isSound', (data) => {
                this.isSound.push(data)
            })

        },
        mounted() {
            eventBus.on("restartGame", (data) => {
                restart()
            })
            ////
            // VARIABLES
            ////
            // Ecrans de chargement
            let ressourcesLoad, loadingScreen, deathScreen
            // ThreeJs : graphic
            let scene, camera, clock, deltaTime, weaponActuel, renderer, raycaster, tmpPos, mixers
            const canvas = this.$refs.scene                 // Canvas affiche le jeu
            //  AmmoJs : physic
            let physicsWorld, tmpTrans, rigidBodies, cbContactResult, cbContactPairResult
            // Game
            let fpsControls, inventory, indexWeapon, weaponWallArea, actualWeaponWall, hitboxPlayer, zombieKillArea, lavaArea, inLavaTimer, playerInLavaInterval, zoomView, bullets, zoom, keyboard, previousWeapon, round, remainZombie, gameStop, clips, newRound, backgroundSound, backgroundSoundActive
            
            let player = this.player
            let score = this.score
            let isSound = this.isSound               // Parametre active son

            // Mise en place du viseur
            this.viseur = new URL('../../assets/Icons/viseur_white.png', import.meta.url).href
            this.remainBullets = weapons[this.player.weapon].parameters.remainBullets        // Met a
            this.remainLoaders = weapons[this.player.weapon].parameters.remainLoaders
            this.loader = weapons[this.player.weapon].parameters.loader

            async function initVariable(){
                // loading et death screen
                ressourcesLoad = false
                loadingScreen = deathScreen = null
                // ThreeJs : graphic
                scene = camera = clock = deltaTime = weaponActuel = null
                renderer = new THREE.WebGLRenderer()        // Fonction de rendu
                raycaster = new THREE.Raycaster()           // Axe de tire
                tmpPos = new THREE.Vector3()
                mixers = []
                //  AmmoJs : physic
                physicsWorld = tmpTrans = cbContactResult = cbContactPairResult = null
                rigidBodies = []
                // Game
                fpsControls = null
                player = {height: 1.8, canShoot: true, canJump: true, speed: 0.065, turnSpeed: Math.PI*0.02, alive: true, weapon: 'pistolSilencer', weaponMesh: null},
                inventory = ['knife']
                indexWeapon = 1
                weaponWallArea = []             // Liste des objets 'zone de colision', pour récupérer les armes sur les murs
                actualWeaponWall = null                // Arme achetable actuelle
                hitboxPlayer = null
                zombieKillArea = []             // Liste des position des zombies, avec mort si contact
                lavaArea = null                        // Zone de lave = degs
                inLavaTimer = 0                 // Timer durée joueur dans la lave
                playerInLavaInterval            // Timer dans la lave, pour pouvoir le lancer et le stoper
                zoomView = 'not-aim'
                bullets = []                    // Listes des balles en jeu
                zoom = false                    // Permet de savoir si on vise, ou non
                keyboard = {}                   // Liste des touches actives, ou non
                previousWeapon = 'pistolSilencer'
                round = 0
                remainZombie = 0                    // Zombie restants
                gameStop = false                    // Sert a mettre en pause le jeu
                clips = null                               // Liste des animations dispos
                newRound = null                            // Pour savoir nouvelle manches
                backgroundSound = null                     // Son de fond
                backgroundSoundActive = false
                score = 0
                isSound = [false]               // Parametre active son
            }

            // AmmoJs : création physiques
            var engine = Ammo()
            engine.then(
                start
            )

            function restart(){
                location.href = location.href
            }
            async function start(){
                // On commence par init les variables
                await initVariable()
                // On commence par afficher l'ecran de chargemement
                loadScreen()
                // Moteur de rendu, fait les frame
                renderFrame()
                //
                tmpTrans = new Ammo.btTransform();
                // Physic : Ammo
                setupPhysicsWorld()
                // Crée l'élement scene et les différents élement permettant l'affichage
                setupGraphics()
                // Prepare anim de la mort
                deathScreenAnim()
                // Ajout les élement à la scene
                await initScene()
                // Ajout des cibles
                await setTarget()
                // Chargement des armes
                await setWeapons()
                // Affiche les armes sur les murs, pour achat
                await setWallWeapons()
                // Setup des event clavier/souris
                setupEventHandlers()
                // Mise en place des fonction de contact
                setupContactResultCallback()
                setupContactPairResultCallback();
                // Enlève l'ecran de chargement
                ressourcesLoad = true
                // Check si joueur dans la lave
                checkPlayerInLava()
            }
            ////
            // Loading screen
            ////
            function loadScreen(){
                loadingScreen = {
                    scene: new THREE.Scene(),
                    camera: new THREE.PerspectiveCamera(90, 1280/720, 0.1, 100),
                    box: new THREE.Mesh(
                        new THREE.BoxGeometry(0.5, 0.5, 0.5),
                        new THREE.MeshBasicMaterial({ color:0x4444ff })
                    )
                }
                // Préparation de l'écran de chargement
                loadingScreen.box.position.set(0, 0, 5)
                loadingScreen.camera.lookAt(0, 0, 5)
                loadingScreen.scene.add(loadingScreen.box)
            }
            //////////////////
            // Ecran anim mort
            //////////////////
            function deathScreenAnim(){
                deathScreen = {
                    scene: scene,
                    camera: new THREE.PerspectiveCamera(90, 1280/720, 0.1, 100),
                }
                // Préparation de l'écran de chargement
                deathScreen.camera.rotation.set(0, Math.PI, 0)
                deathScreen.camera.position.set(0, 12, -11)
            }
            ////
            // Setup AmmoJs
            ////
            function setupPhysicsWorld(){
                // J'ai pas tout capté, mais tous les premier éléments sont nécessaires pour la variable physicsWorld (où simulation physique s'effectue)
                let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
                let dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
                let overlappingPairCache = new Ammo.btDbvtBroadphase()
                let solver = new Ammo.btSequentialImpulseConstraintSolver()
                // Création monde physique
                physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
                physicsWorld.setGravity(new Ammo.btVector3(0, -2, 0));
            }
            ////
            // Création de la scene init des élements graphiques
            ////
            function setupGraphics(){
                //create clock for timing
                clock = new THREE.Clock();
                // Init caméra
                camera = new THREE.PerspectiveCamera(75,canvas.clientWidth / canvas.clientHeight,0.1,100);
                // Position camera
                camera.position.set(0, player.height, 0)
                camera.lookAt(0, player.height, 0)
                camera.userData.tag = 'cameraPlayer'
                // Init rendu
                renderer.setSize(canvas.clientWidth, canvas.clientHeight);  // taille
                renderer.shadowMap.enabled = true               // Active les ombres
                renderer.shadowMap.type = THREE.BasicShadowMap  // Type d'ombres
                // Créer le canvas
                canvas.appendChild(renderer.domElement);
                // Ajout d'un id au canvas
                document.querySelector("canvas").setAttribute("id", "inLavaId" )
                // Création scene
                scene = new THREE.Scene()
                scene.background = new THREE.Color( 0x000000 );
                // POV, class js
                fpsControls = new FirstPersonCamera(camera);

                // Hitbox pour les zones d'armes
                hitboxPlayer = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
                // hitboxPlayer.setFromCenterAndSize(camera.position, new THREE.Vector3(0.8, 2, 0.8))
                // Ambient light
                let ambientLight = new THREE.AmbientLight(0xFFD8C4, 0.5)
                scene.add(ambientLight)
                // Light
                let light = new THREE.PointLight(0xFCB490, 0.8, 10)
                light.position.set(2, 2, 2)
                light.castShadow = true
                light.shadow.camera.near = 0.1
                light.shadow.camera.far = 25
                scene.add(light)
                // Musique de fond
                const listener = new THREE.AudioListener()
                camera.add(listener)

                const audioLoader = new THREE.AudioLoader()
                backgroundSound = new THREE.Audio(listener)
                audioLoader.load(sounds['CouldYouBeLoved'].soundSrc, function( buffer ){
                    backgroundSound.setBuffer(buffer)
                    backgroundSound.setLoop(true)
                    backgroundSound.setVolume(0.8)
                })
            }
            ////
            // Ajout des élements à la scene, chargement graphique des éléments
            ////
            async function initScene(){
                // Sol : THREEHS
                const floor = new THREE.Mesh(
                    new THREE.PlaneGeometry(100, 100),
                    new THREE.MeshBasicMaterial({color: 0x808080, wireframe: false})
                )
                floor.position.set(0, 0, 0)
                floor.rotation.x -= Math.PI / 2;
                floor.userData.tag = "floor"
                scene.add(floor)

                // Texture lava
                const lavaTexture = new THREE.TextureLoader().load("./static/Texture/Lava.png")
                // Lava : THREEHS
                const lava = new THREE.Mesh(
                    new THREE.BoxGeometry(6, 0.3, 6),
                    new THREE.MeshBasicMaterial({map: lavaTexture})
                )
                lava.position.set(6, 0, 1)
                lava.userData.tag = "lava"
                scene.add(lava)
                // ------ ZONE DE LAVE
                lavaArea = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
                // On crée la zone par rapport à la position de la lave, et une zone de 6, 4, 6 de coté
                lavaArea.setFromCenterAndSize(lava.position, new THREE.Vector3(6, 4, 6))


                // Ammojs Section
                let transform = new Ammo.btTransform();
                transform.setIdentity();
                transform.setOrigin( new Ammo.btVector3(0, 0, 0));
                transform.setRotation( new Ammo.btQuaternion(0, 0, 0, 1));
                let motionState = new Ammo.btDefaultMotionState( transform );
                // Equivalent hitbox
                let colShape = new Ammo.btBoxShape( new Ammo.btVector3(35, 0.1, 35));
                colShape.setMargin( 0.05 );

                let localInertia = new Ammo.btVector3( 0, 0, 0 );
                colShape.calculateLocalInertia( 0, localInertia );

                let rbInfo = new Ammo.btRigidBodyConstructionInfo( 0, motionState, colShape, localInertia );
                let body = new Ammo.btRigidBody( rbInfo );
                //
                body.setFriction(4);
                body.setRollingFriction(10);
                // Ajout au monde physic
                physicsWorld.addRigidBody( body );
                body.threeObject = floor;

                // Ajout des items pour faire la map, du fichier sceneItems.js
                const keys = Object.keys(sceneItems);
                // Pour chaques items
                for (const element of keys) {
                    const key = element;
                    const sceneItem = sceneItems[key];
                    try {
                        // ------ THREEJS SECTION
                        // Load items for scene
                        const materialItem = await loadMTL(sceneItem.mtl);
                        await materialItem.preload();

                        const materielMesh = await loadOBJ(sceneItem.obj, materialItem);
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
                        materielMesh.scale.set(
                            sceneItem.scale,
                            sceneItem.scale,
                            sceneItem.scale
                        );
                        // Ajout d'un tag pour différencier
                        materielMesh.userData.tag = "sceneItem"
                        // Ajout de la mesh à l'objet de l'item
                        sceneItem.mesh = materielMesh;
                        // Ajout à la scene
                        scene.add(materielMesh)
                        //// -------------------
                        // ------ AMMOJS SECTION
                        let mass = 0    // Mass=0 : objet immobile
                        let transform = new Ammo.btTransform()
                        transform.setIdentity()
                        // Position
                        transform.setOrigin( new Ammo.btVector3(
                            sceneItem.hitBoxPosition.x,
                            sceneItem.hitBoxPosition.y,
                            sceneItem.hitBoxPosition.z
                        ));
                        // Rotation
                        transform.setRotation( new Ammo.btQuaternion(
                            sceneItem.rotation.x,
                            sceneItem.rotation.y,
                            sceneItem.rotation.z,
                            1
                        ));
                        let motionState = new Ammo.btDefaultMotionState( transform );
                        // Equivalent hitbox
                        let colShape = new Ammo.btBoxShape( new Ammo.btVector3(
                            sceneItem.hitBox.x,
                            sceneItem.hitBox.y,
                            sceneItem.hitBox.z,
                        ));
                        colShape.setMargin( 0.05 );
                        // Inertie
                        let localInertia = new Ammo.btVector3( 0, 0, 0 );
                        colShape.calculateLocalInertia( mass, localInertia );
                        // Création de l'element physique, avec ses attributs
                        let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
                        let body = new Ammo.btRigidBody( rbInfo );
                        // Ajout du body au monde physique, avec contraintes de colisions
                        physicsWorld.addRigidBody( body );

                        rigidBodies.push(materielMesh)
                        materielMesh.userData.physicsBody = body
                        body.threeObject = materielMesh

                    } catch (error) {
                        console.error("Erreur lors du chargement de la physique d'un élement", error);
                    }
                }

                // // Image en 360 : stade
                // const hdrTexture = new URL('../../assets/FondHdr/stadium.hdr', import.meta.url);
                // const loader = new RGBELoader()
                // // Set hdr on background
                // loader.load(hdrTexture, function(texture){
                //     texture.mapping = THREE.EquirectangularReflectionMapping
                //     scene.background = texture;
                // })
            }
            ////
            // Fonctions pour charger les élements 'obj' et 'mtl'
            ////
            async function loadMTL(mtlPath) {                  // Decoupe de la fonction setWeapons, pour les await/async
                return new Promise((resolve, reject) => {
                    const mtlLoader = new MTLLoader();
                    mtlLoader.load(mtlPath, resolve, undefined, reject);
                });
            }
            async function loadOBJ(objPath, materials) {       // Decoupe de la fonction setWeapons, pour les await/async
                return new Promise((resolve, reject) => {
                    const objLoader = new OBJLoader();
                    objLoader.setMaterials(materials);
                    objLoader.load(objPath, resolve, undefined, reject);
                });
            }
            ////
            // Ajout des cibles sur la scene, chargement élements graphiques
            ////
            async function setTarget(){
                // MAJ nombre de round
                round ++
                eventBus.emit("roundNumber", round)
                // Mise a jour nouvelle manche
                newRound = true
                // Formule nb zombie en fonction du round
                let zombieNumber = (round * 1.41) + 2.6
                remainZombie = parseInt(zombieNumber)
                // Vie par zombie = nombre de balles
                let zombieLife = 3
                // Ajout des items du fichier tagetItems.js
                // Chaque zombie a : une partie graphic, une partie physique, une partie animation
                const gltfLoader = new GLTFLoader();
                // On récupère le zombie dans la liste des cibles
                const zombieGltf = targetItems["zombieMale"]
                for (let i = 0; i<parseInt(zombieNumber); i++) {
                    try {
                        gltfLoader.load(zombieGltf.gltf, (gltf) => {
                            /////////////////////////
                            // ---------------THREEJS
                            // On récupère les positions de spawn dans une liste
                            let keyLength = Object.keys(spawnsCoord).length
                            let keySpawn = parseInt(Math.random() * keyLength) + 1
                            let acutalSpawn = spawnsCoord[keySpawn]
                            // Assignation des coords de spawn a l'endroit de spawn du zombie
                            let pos = {
                                x: acutalSpawn.x,
                                y: acutalSpawn.y,
                                z: acutalSpawn.z
                            };
                            let scale = {x: 0.8, y: 0.8, z: 0.8};
                            let quat = {x: 0, y: 0, z: 0, w: 1};
                            let mass = 1;
                            // Equivalent mesh
                            const zombie = gltf.scene
                            // Ombre de l'objet
                            zombie.castShadow = true;
                            zombie.receiveShadow = true
                            // Position
                            zombie.position.set(pos.x, pos.y, pos.z)
                            // Echelle
                            zombie.scale.set(scale.x, scale.y, scale.z)
                            // Ajout d'un tag pour différencier
                            zombie.userData.tag = "targetItem_zombie"
                            // Vie du zombie
                            zombie.userData.remainLife =  zombieLife
                            // Ajout d'un score 'donnable'
                            zombie.userData.points = true
                            // Ajout à la scene
                            scene.add(zombie)

                            /////////////////////////
                            // -------------ANIMATION
                            let mixer = new THREE.AnimationMixer(zombie)
                            clips = gltf.animations
                            const clip = THREE.AnimationClip.findByName(clips, 'Walk')
                            let action = (mixer.clipAction(clip))
                            action.play()
                            mixers.push(mixer)

                            /////////////////////////
                            // ----------------AMMOJS
                            let transform = new Ammo.btTransform()
                            transform.setIdentity()
                            // Position
                            transform.setOrigin( new Ammo.btVector3(
                                pos.x,
                                pos.y,
                                pos.z,
                            ));
                            // Rotation
                            transform.setRotation( new Ammo.btQuaternion(
                                quat.x,
                                quat.y,
                                quat.z,
                                quat.w,
                            ));
                            let motionState = new Ammo.btDefaultMotionState( transform );
                            // Hitbox
                            let colShape = new Ammo.btBoxShape( new Ammo.btVector3(
                                scale.x * 0.8,
                                2,
                                scale.z * 0.8,
                            ));
                            colShape.setMargin( 0.05 );
                            // Inertie
                            let localInertia = new Ammo.btVector3( 0, 0, 0 );
                            colShape.calculateLocalInertia( mass, localInertia );
                            // Création de l'element physique, avec ses attributs
                            let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
                            let body = new Ammo.btRigidBody( rbInfo );
                            // Ajout du body au monde physique, avec contraintes de colisions
                            physicsWorld.addRigidBody( body );

                            rigidBodies.push(zombie)
                            zombie.userData.physicsBody = body
                            body.threeObject = zombie

                            ///////////////////////////////////////
                            // -------------HITBOX ZOMBIE POUR MORT JOUEUR
                            const detectionArea = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
                            // On crée la zone par rapport à la position de l'arme, et une zone de 8 de coté
                            detectionArea.setFromCenterAndSize(zombie.position, new THREE.Vector3(1, 3, 1))
                            // On ajout à la liste des zone d'arme sur mur
                            zombieKillArea.push([detectionArea, zombie.uuid, "zombie"])
                   
                        }, undefined, (error) => {
                            console.log(error)
                        })
                    } catch (error) {
                        console.error("Erreur lors du chargement de la physique d'un élement", error);
                    }
                }
            }
            ////
            // Chargement graphique des armes
            ////
            async function setWeapons(){
                let playerWeapon = player.weapon
                // Permet d'avoir un id par item
                const keys = Object.keys(weapons);
                // Pour chaques items
                for (const element of keys) {
                    const key = element;
                    const weapon = weapons[key];
                    try {
                        // ------ THREEJS SECTION
                        // Load weapons
                        const materials = await loadMTL(weapon.mtl);

                        await materials.preload();

                        const weaponMesh = await loadOBJ(weapon.obj, materials);
                        weaponMesh.receiveShadow = true
                        // Position et taille de l'arme
                        weaponMesh.position.set(1, 2, 0);
                        weaponMesh.scale.set(5, 5, 5);
                        weaponMesh.name = key
                        // Ajout d'un tag
                        weaponMesh.userData.tag = "weapon_"+key
                        weapon.mesh = weaponMesh;

                        if(playerWeapon == key){
                            // Lors de l'init des armes, on ajoute le nom du pistolet en premiere place
                            inventory.push(key)
                            // On set la nouvel arme du joueur avant d'appeler la fonction
                            await setWeapon(1)
                        }
                        /////
                        //----- Ammo bullet for weapon, couteau n'as pas de munition
                        if(key != "knife"){
                            const ammoMaterials = await loadMTL(weapon.ammo.mtl);

                            await materials.preload();

                            const ammoMesh = await loadOBJ(weapon.ammo.obj, ammoMaterials);
                            ammoMesh.receiveShadow = true
                            ammoMesh.scale.set(15,15,15)
                            // Ajout tag
                            ammoMesh.userData.tag = "ammo_" + key

                            weapon.ammo.mesh = ammoMesh;
                        }
                        /////////////
                        // Pas besoin de physic pour le skin des armes
                    } catch (error) {
                        console.error("Erreur lors du chargement de la physique d'un élement", error);
                    }
                }
            }
            async function setWeapon(index){
                    // On récupère a l'arme actuel, celle dans la position 0 de l'inventaire
                    let objectToRemove = null                   // Var qui va recevoir l'objet de l'ancienne arme, à enlever
                    let nextWeapon = inventory[index]         // Récupère arme actuel, dans les données user
                    // On 'traverse' la liste des objets sur la scene, pour trouver les meshs
                    scene.traverse( function( object ) {
                        if(object.isObject3D && object.name == previousWeapon){  // 3DObject peut être enlevé de la scène
                            objectToRemove = object
                        }
                    });
                    // On change la var dernière arme, avec celle que l'on va ajouter
                    previousWeapon = nextWeapon
                    // Supprime de la scene
                    scene.remove(objectToRemove)
                    // Créer un nouveau mesh pour poser l'arme
                    let newMeshWeapon = weapons[nextWeapon].mesh.clone()
                    // Vision gun : Position
                    let time = Date.now() * 0.0005
                    newMeshWeapon.position.set(
                        camera.position.x - Math.sin(camera.rotation.y - Math.PI/6) * 0.6,
                        camera.position.y - 0.2 + Math.sin(time*4 + camera.rotation.x + camera.rotation.z)*0.01,
                        camera.position.z - Math.cos(camera.rotation.y - Math.PI/6) * 0.6
                    )
                    // Rotation
                    newMeshWeapon.rotation.set(
                        camera.rotation.x,
                        camera.rotation.y + Math.PI,
                        camera.rotation.z
                    )
                    scene.add(newMeshWeapon)
            }
            ////
            // Place les armes sur les murs
            ////
            async function setWallWeapons(){
                // Ajout des armes sur le mur
                const weaponsCoordkeys = Object.keys(weaponsCoord);
                // Pour chaques items
                for (const element of weaponsCoordkeys) {
                    const weaponData = weaponsCoord[element];
                    try {
                        // ------ THREEJS SECTION
                        // On récupère le mesh
                        const materielMesh = weapons[element].mesh.clone()
                        // Ombre de l'objet
                        materielMesh.receiveShadow = true
                        materielMesh.castShadow = true
                        // Position
                        materielMesh.position.set(
                            weaponData.position.x,
                            weaponData.position.y,
                            weaponData.position.z,
                        );
                        // Rotation
                        materielMesh.rotation.set(
                            weaponData.rotation.x,
                            weaponData.rotation.y,
                            weaponData.rotation.z,
                        )
                        // Echelle
                        materielMesh.scale.set(
                            weaponData.scale,
                            weaponData.scale,
                            weaponData.scale
                        );
                        // Ajout d'un tag pour différencier
                        materielMesh.userData.tag = "weaponWall"
                        materielMesh.userData.name = element
                        // Ajout à la scene
                        scene.add(materielMesh)
                        // ------ LIGHT SECTION
                        // Ajout d'une lumière derrière l'arme
                        let light = new THREE.PointLight(0x3b83f7, 0.8, 5)
                        light.position.set(
                            weaponData.light.x,
                            weaponData.light.y,
                            weaponData.light.z,
                        )
                        light.castShadow = true
                        scene.add(light)
                        // ------ ZONE AUTOUR DE L'ARME
                        const detectionArea = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
                        // On crée la zone par rapport à la position de l'arme, et une zone de 8 de coté
                        detectionArea.setFromCenterAndSize(materielMesh.position, new THREE.Vector3(4, 4, 4))
                        // On ajout à la liste des zone d'arme sur mur
                        weaponWallArea.push([detectionArea, element])

                    } catch (error) {
                        console.error("Erreur lors du chargement de la physique d'un élement", error);
                    }
                }
            }
            ////
            // Mise en place des fonction d'évenement
            ////
            function setupEventHandlers(){
                document.addEventListener('click', (e) => onClick(e), false)       // Tire
                document.addEventListener('contextmenu', (e) => onContextMenu(e), false)    // Viseur
                document.addEventListener('keyup', (e) => keyUp(e), false)  // Appuie d'une touche
                document.addEventListener('keydown', (e) => keyDown(e), false)  // Lachement d'une touche
                document.addEventListener('wheel', (e) => wheel(e), false)  // Roulette inventaire
            }

            // Roulette inventaire
            function wheel(e){
                // Taille de l'inventaire, pour pas aller sur un index qui n'existe pas. Savoir la taille, pour le max : 1 ou 2 sur [0:X]
                let max = inventory.length - 1
                if(e.deltaY > 0){
                    indexWeapon == max ? indexWeapon = 0 : indexWeapon ++
                } else {
                    indexWeapon == 0 ? indexWeapon = max : indexWeapon --
                }
                // On change l'arme, avec le nouvel index
                setWeapon(indexWeapon)
                // On met à jour l'affichage des balles
                eventBus.emit("remainBullets", ([weapons[inventory[indexWeapon]].parameters.remainBullets, weapons[inventory[indexWeapon]].parameters.remainLoaders, weapons[inventory[indexWeapon]].parameters.loader]))
                // On met a true, pour check si le joueur peut tirer avec la nouvelle arme en main
                player.canShoot = true
            }

            // Tire au click
            function onClick(e){
                // Si jeu en pause, joueur mort, ou attente de pouvoir tirer, on fait rien
                if(gameStop || !player.alive || !player.canShoot){
                } else {
                    // Si couteau, pas de tire de balle
                    if(inventory[indexWeapon] == "knife"){

                    } else {
                        // Permet de limiter le nombre de tire par secondes, en fonction des armes
                        player.canShoot = false
                        // Parametres de l'arme du jour. Mise dans variable pour simplifier les appels ensuite
                        let playerWeaponParameters = weapons[inventory[indexWeapon]].parameters
                        // Si il reste des balles dans le chargeur, -1, et tirer normalement
                        if(playerWeaponParameters.remainBullets > 0){
                            playerWeaponParameters.remainBullets = playerWeaponParameters.remainBullets - 1
                            // Timer de cadence de tire
                            setTimeout(function(){
                                player.canShoot = true
                            }, playerWeaponParameters.shootTimer)

                            // ------ THREEJS SECTION
                            // Balle, en fonction de l'arme
                            let bullet = weapons[inventory[indexWeapon]].ammo.mesh.clone()

                            let bulletPos

                            // Position de départ de la balle, en fonction de la vue (visé ou non)
                            if(zoomView == 'not-aim'){
                                bulletPos = new THREE.Vector3(
                                    camera.position.x - Math.sin(camera.rotation.y - Math.PI/6) * 0.6,
                                    camera.position.y - 0.13,
                                    camera.position.z - Math.cos(camera.rotation.y - Math.PI/6) * 0.6
                                )
                            } else {
                                bulletPos = new THREE.Vector3(
                                    camera.position.x - Math.sin(camera.rotation.y) * 0.6,
                                    camera.position.y - playerWeaponParameters.positionAimY,    // Position en fonction de l'arme
                                    camera.position.z - Math.cos(camera.rotation.y) * 0.6
                                )
                            }
                            // Position de la balle, en fonction de la vue (visé ou non)
                            bullet.position.set(
                                bulletPos.x,
                                bulletPos.y,
                                bulletPos.z
                            )
                            // Coord 2 vector
                            let middleScreen =  new THREE.Vector2(0, 0)
                            raycaster.setFromCamera(middleScreen, camera)
                            raycaster.ray.origin = bulletPos
                            // Set ray vector
                            tmpPos.copy(raycaster.ray.direction)
                            tmpPos.add(raycaster.ray.origin)
                            // Ombre
                            bullet.receiveShadow = true
                            // Aligne la balle par rapport à l'arme
                            bullet.rotation.set(
                                camera.rotation.x,
                                camera.rotation.y + Math.PI/2,
                                camera.rotation.z - Math.PI/2
                            )
                            // Timer 'durée de vie' de la balle
                            setTimeout(function(){
                                try {
                                    bullet.alive = false
                                    // On enleve le graphic
                                    scene.remove(bullet)
                                    // On cherche l'index de la bullet
                                    const physicBullet = rigidBodies.findIndex((obj) => obj.uuid === bullet.uuid);
                                    // Si index > -1, c'est que l'objet est dans la liste, donc sur la scene
                                    if (physicBullet > -1) {
                                        // On enleve la partie physique de la liste
                                        rigidBodies.splice(physicBullet, 1);
                                        // On enleve du monde physic
                                        physicsWorld.removeRigidBody(bullet.userData.physicsBody)
                                }
                                } catch (error) {
                                    console.log("timoutBulletError : ",error)
                                }
                            }, 3000)
                            // affiche bullet
                            bullet.alive = true;
                            bullets.push(bullet)
                            // Ajout la bullet à la scene
                            scene.add(bullet)
                            //// -------------------
                            // ------ AMMOJS SECTION
                            let mass = 1    // Mass=0 : objet immobile
                            let transform = new Ammo.btTransform()
                            transform.setIdentity()
                            // Position de départ de la balle, en fonction de la vue (visé ou non)
                            transform.setOrigin( new Ammo.btVector3(
                                bulletPos.x,
                                bulletPos.y,
                                bulletPos.z
                            ));
                            // Rotation
                            transform.setRotation( new Ammo.btQuaternion(
                                camera.rotation.x,
                                camera.rotation.y + Math.PI/2,
                                camera.rotation.z,
                                1
                            ));
                            let motionState = new Ammo.btDefaultMotionState( transform );
                            // Object autour, qui va avoir la colision
                            let colShape = new Ammo.btBoxShape( new Ammo.btVector3( 0.1, 0.1, 0.1));
                            colShape.setMargin( 0.05 );
                            // Inertie
                            let localInertia = new Ammo.btVector3( 0, 0, 0 );
                            colShape.calculateLocalInertia( mass, localInertia );
                            // Création de l'element physique, avec ses attributs
                            let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
                            let body = new Ammo.btRigidBody( rbInfo );
                            // Ajout du body au monde physique, avec contraintes de colisions
                            physicsWorld.addRigidBody( body );
                            // Place balle et donne la velocite
                            tmpPos.copy(raycaster.ray.direction)
                            tmpPos.multiplyScalar(60)
                            body.setLinearVelocity(new Ammo.btVector3(
                                tmpPos.x,
                                tmpPos.y,
                                tmpPos.z
                            ))
                            bullet.userData.physicsBody = body
                            rigidBodies.push(bullet)
                            body.threeObject = bullet
                            ////
                            // Recule au tir
                            ////
                            // updateRecoil()

                            ////
                            // Son au tire
                            ////
                            if((isSound[isSound.length - 1])){

                                const listener = new THREE.AudioListener()
                                camera.add(listener)

                                const audioLoader = new THREE.AudioLoader()
                                let shootSound = new THREE.Audio(listener)
                                audioLoader.load(weapons[inventory[indexWeapon]].soundSrc, function( buffer ){
                                    shootSound.setBuffer(buffer)
                                    shootSound.setLoop(false)
                                    shootSound.setVolume(0.3)
                                    shootSound.play()
                                })
                            }
                            // On vérifie s'il reste des balles dans le chargeur actuel, et les autres
                            if(playerWeaponParameters.remainBullets == 0 && playerWeaponParameters.remainLoaders != 0){
                                // On enlève un chargeur
                                playerWeaponParameters.remainLoaders = playerWeaponParameters.remainLoaders - 1
                                // Le joueur peut pas tirer pendant le chargement
                                player.canShoot = false
                                // Timer chargement arme
                                setTimeout(function(){
                                    // Remises des balles dans le chargeur
                                    playerWeaponParameters.remainBullets = playerWeaponParameters.loader
                                    // Peut tirer
                                    player.canShoot = true
                                    // MAJ Nombre de balle restantes
                                    eventBus.emit("remainBullets", ([playerWeaponParameters.remainBullets, playerWeaponParameters.remainLoaders, weapons[inventory[indexWeapon]].parameters.loader]))
                                }, playerWeaponParameters.loadTimer)
                            }
                        }
                        eventBus.emit("remainBullets", ([playerWeaponParameters.remainBullets, playerWeaponParameters.remainLoaders, weapons[inventory[indexWeapon]].parameters.loader]))
                    }
                }
            }
            // Recul au tir
            function updateRecoil(){

                weaponActuel.rotation.set(
                    camera.position.x + Math.sin(camera.rotation.y - Math.PI/4),
                    camera.rotation.y + Math.PI,
                    camera.position.z + Math.cos(camera.rotation.y + Math.PI/4)
                )
            }

            // Click droit = viser !
            function onContextMenu(e){
                // Désactive le menu en clique droit
                e.preventDefault()
                // Active le zoom ou non
                if(zoom){
                    camera.fov = 40;
                    camera.updateProjectionMatrix();
                    document.getElementsByClassName('icon-viseur')[0].style.height = '75px'
                    document.getElementsByClassName('icon-viseur')[0].style.width = '75px'
                    // Passe l'arme en mode 'visé'
                    zoomView = "aim"
                } else {
                    camera.fov = 75;
                    camera.updateProjectionMatrix();
                    document.getElementsByClassName('icon-viseur')[0].style.height = '40px'
                    document.getElementsByClassName('icon-viseur')[0].style.width = '40px'
                    // Passe l'arme en mode visé
                    zoomView = "not-aim"
                }
                zoom = !zoom
            }
            function keyDown(e){
                keyboard[e.keyCode] = true
                keyUse()
            }
            function keyUp(e){
                keyboard[e.keyCode] = false
                keyUse()
            }

            function keyUse(){
                if(keyboard[27]){       // Esc, menu pause
                    if(!gameStop){
                        gameStop = true
                    } else {
                        if(!(isSound[isSound.length - 1])){
                            backgroundSound.pause()
                        }
                        gameStop = false
                        renderFrame()
                    }
                    eventBus.emit("gameStop", gameStop)
                }
                // Active le son de fond
                if(keyboard[80]){   // P
                    backgroundSoundPlay()
                }
                // Permet d'achter une arme sur un mur : F
                if(keyboard[70] && actualWeaponWall != null && weapons[actualWeaponWall].price <= score){
                    // Si on a 1 couteau et 1 arme dans inventaire, on ajout directement
                    if(inventory.length < 3){
                        inventory.push(actualWeaponWall)
                        indexWeapon = 2
                        setWeapon(2)
                    } else {    // On check si on remplace l'arme actuel, ou si on ajoute munitions
                        let weaponInInvetory = false 
                        let ammoWeaponIndex
                        // On check si déjà dans inventaire
                        inventory.forEach((item, index) => {
                            if(item == actualWeaponWall){
                                weaponInInvetory = true
                                ammoWeaponIndex = index
                            }
                        })
                        // Ajout de munition
                        if(weaponInInvetory){
                            // On récupère les parametres de l'arme actuel
                            let reloadBullets = weapons[inventory[ammoWeaponIndex]].parameters
                            // Remises des balles dans le chargeur
                            reloadBullets.remainBullets = reloadBullets.loader
                            // Remise de 4 chargeurs
                            reloadBullets.remainLoaders = 4
                            // MAJ affichage
                            eventBus.emit("remainBullets", ([reloadBullets.remainBullets, reloadBullets.remainLoaders, reloadBullets.loader]))

                        } else {
                            // On supprime l'arme actuel de la scene
                            scene.traverse( function( object ) {
                                if(object.isObject3D && object.name == inventory[indexWeapon]){  // 3DObject peut être enlevé de la scène
                                    scene.remove(object)
                                }
                            });
                            // Puis on ajoute la nouvelle
                            inventory[indexWeapon] = actualWeaponWall
                            setWeapon(indexWeapon)
                        }
                    }
                    // On met à jour le score
                    score -= weapons[actualWeaponWall].price
                    eventBus.emit("scoreChange", score)
                    // On met à jour l'affichage des balles
                    eventBus.emit("remainBullets", ([weapons[inventory[indexWeapon]].parameters.remainBullets, weapons[inventory[indexWeapon]].parameters.remainLoaders, weapons[inventory[indexWeapon]].parameters.loader]))
                }
                if(keyboard[79]){   // O : Permet de tuez un zombie immortel
                    if(remainZombie > 0){
                        // On recupere l'index du zombie limbo
                        const physicIndex = rigidBodies.findIndex((obj) => obj.userData.tag === "targetItem_zombie");
                        let sceneObject
                        scene.traverse( function( object ) {
                            if(object.isObject3D && object.userData.tag == "targetItem_zombie"){
                                sceneObject = object
                            }
                        });
                        // Si index > -1, c'est que les objets sont dans la liste, donc sur la scene
                        if (physicIndex > -1) {
                            // On enleve la partie physic de la liste
                            rigidBodies.splice(physicIndex, 1);
                            // On enleve du monde physic
                            physicsWorld.removeRigidBody(sceneObject.userData.physicsBody)
                            // On enleve la partie graphic
                            scene.remove(sceneObject)
                            // A la mort : 100 points
                            score += 100
                            eventBus.emit("scoreChange", score)
                            // On decremente le nombre de zombie restant
                            remainZombie = remainZombie - 1
                        }
                    }
                }
            
            
            }


            function backgroundSoundPlay(){
                if((isSound[isSound.length - 1])){
                    if(backgroundSoundActive){
                        backgroundSound.pause()
                    } else{
                        backgroundSound.play()
                    }
                    backgroundSoundActive = !backgroundSoundActive
                }
            }


            ////
            // Contact entre 2 physicBody
            ////
            function setupContactResultCallback(){
                cbContactResult = new Ammo.ConcreteContactResultCallback();
                cbContactResult.addSingleResult = function(cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1){

                    let contactPoint = Ammo.wrapPointer( cp, Ammo.btManifoldPoint );
                    const distance = contactPoint.getDistance();
                    if( distance > 0 ) return;

                    let colWrapper0 = Ammo.wrapPointer( colObj0Wrap, Ammo.btCollisionObjectWrapper );
                    let rb0 = Ammo.castObject( colWrapper0.getCollisionObject(), Ammo.btRigidBody );

                    let colWrapper1 = Ammo.wrapPointer( colObj1Wrap, Ammo.btCollisionObjectWrapper );
                    let rb1 = Ammo.castObject( colWrapper1.getCollisionObject(), Ammo.btRigidBody );

                    let threeObject0 = rb0.threeObject;
                    let threeObject1 = rb1.threeObject;
                    
                    // console.log(threeObject0.userData.tag, threeObject1.userData.tag)

                    // Si la balle (dans threeObject0) touche un zombie (cible dans threeObject1)
                    if(threeObject0.userData.tag == "ammo_"+inventory[indexWeapon] && threeObject1.userData.tag == "targetItem_zombie"){
                        // Si la vie est > 0, on décremente, sinon on tue
                        if(threeObject1.userData.remainLife > 0){
                            threeObject1.userData.remainLife -= 1
                        } else if (threeObject1.userData.points) { // Zombie mort
                            // Permet de changer l'animation du zombie, et de ne pas comptabiliser plusieurs fois un zombie
                            mixers.forEach((mixer, index) => {
                                // Celui qui correspond à l'uuid du zomb touché
                                if(mixer._root.uuid == threeObject1.uuid && mixer._actions[0]._clip.name == 'Walk'){
                                    // On commence par stopper l'animation
                                    mixers.splice(index, 1)
                                    // On créé un nouveau mixer, pour ne pas avoir l'anim précédente
                                    const clip = THREE.AnimationClip.findByName(clips, 'Roll')
                                    let mixer2 = new THREE.AnimationMixer(threeObject1)
                                    let action = (mixer2.clipAction(clip))
                                    action.play()
                                    // On l'ajoute à la liste des anim, pour lancer l'animation tomber
                                    mixers.push(mixer2)
                                    // Les points sont utilisés
                                    threeObject1.userData.points = false
                                    // On enlève la balle pour pas de problème de contacts
                                    // On récupère les index physic des objects
                                    const physicAmmo = rigidBodies.findIndex((obj) => obj.uuid === threeObject0.uuid);
                                    // On enleve la partie physic de la liste
                                    rigidBodies.splice(physicAmmo, 1);
                                    // On enleve du monde physic
                                    physicsWorld.removeRigidBody(threeObject0.userData.physicsBody)
                                    // On enleve la partie graphic
                                    threeObject0.alive = false
                                    scene.remove(threeObject0)
                                    // On enlève la box3, qui sert de hitbox pour la mort du joueur
                                    zombieKillArea.forEach((zombieArea, index) => {
                                        if(zombieArea[1] == threeObject1.uuid){
                                            zombieKillArea.splice(index, 1)
                                        }
                                    })
                                    // On enlève le zombie 2.9 secondes apres
                                    let killInterval
                                    killInterval = setInterval(function(){
                                        if(!threeObject1.userData.points){
                                            // On recupere les index physic des objects
                                            const physicTarget = rigidBodies.findIndex((obj) => obj.uuid === threeObject1.uuid);
                                            // Si index > -1, c'est que les objets sont dans la liste, donc sur la scene
                                            if (physicTarget > -1) {
                                                // On enleve la partie physic de la liste
                                                rigidBodies.splice(physicTarget, 1);
                                                // On enleve du monde physic
                                                physicsWorld.removeRigidBody(threeObject1.userData.physicsBody)
                                                // On enleve la partie graphic
                                                scene.remove(threeObject1)
                                                // A la mort : 100 points
                                                score += 100
                                                eventBus.emit("scoreChange", score)
                                                // On decremente le nombre de zombie restant
                                                remainZombie = remainZombie - 1
                                                clearInterval(killInterval);
                                            }
                                        }
                                    }, 2900)
                                }
                            })
                        }
                    // Si scene, on enlève la balle (a la base, mais pour les tests on l'enlève pas)
                    } else if (threeObject0.userData.tag == "ammo_"+inventory[indexWeapon] && threeObject1.userData.tag == "sceneItem"){
                        // scene.remove(threeObject0)
                    // Si contact entre zombie et joueur : mort
                    } else if((threeObject0.userData.tag == "player_hitbox" ) || (threeObject1.userData.tag == "player_hitbox" )){
                        console.log("Joueur mort")
                    }
                }
            }
            function setupContactPairResultCallback(){

                cbContactPairResult = new Ammo.ConcreteContactResultCallback();
                cbContactPairResult.hasContact = false;
                cbContactPairResult.addSingleResult = function(cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1){

                    let contactPoint = Ammo.wrapPointer( cp, Ammo.btManifoldPoint );
                    const distance = contactPoint.getDistance();
                    if( distance > 0 ) return;

                    this.hasContact = true;
                }
            }
            ////
            // Gestion zombie restant, et nombre de manche
            ////
            function checkZombieRemain(){
                if(remainZombie == 0 && newRound){
                    // On va changer de round
                    newRound = false
                    // On fait clignoter le nombre de manche, prévenir à la suivante
                    eventBus.emit("onChangeRound")
                    setTimeout(async function(){
                        setTarget()
                        ressourcesLoad = true
                    }, 3000)
                }
            }


            ////
            // Moteur de rendu, fait les frames
            ////
            function renderFrame() {

                // Ecran de chargement
                if(!ressourcesLoad){
                    requestAnimationFrame(renderFrame)
                    // Mouvement de la box
                    loadingScreen.box.position.x -= 0.05
                    if(loadingScreen.box.position.x < -10) loadingScreen.box.position.x = 10
                    loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x)

                    renderer.render(loadingScreen.scene, loadingScreen.camera)
                    return
                } else if(!player.alive || gameStop){
                    requestAnimationFrame(renderFrame)
                    // Mouvement de la box
                    deathScreen.camera.position.x -= 0.07

                    if(deathScreen.camera.position.x < -10) deathScreen.camera.position.x = 13
                    deathScreen.camera.position.y = Math.sin(deathScreen.camera.position.x) + 12

                    renderer.render(deathScreen.scene, deathScreen.camera)
                    // return
                } else {
                    // console.log(parseInt(camera.position.x), parseInt(camera.position.z))

                    // Marche ralentie par la lave, sprint ou marche normal
                    if(player.speed == 4){
                        fpsControls.playerSpeed = 4
                    } else if(keyboard[16]){
                        fpsControls.playerSpeed = 11
                    } else {
                        fpsControls.playerSpeed = 7
                    }
                    // AmmoJs update physics : create clock for timing
                    deltaTime = clock.getDelta();
                    updatePhysics( deltaTime );
                    // Animation
                    mixers.forEach((mixer) => {
                        mixer.update(deltaTime/2)
                    })
                    //
                    renderer.render(scene, camera);
                    requestAnimationFrame(renderFrame);
                    // Check nombre de zombie restant dans la manche
                    checkZombieRemain()
                    // On met a jour la position de la hitbox du joueur
                    hitboxPlayer.setFromCenterAndSize(camera.position, new THREE.Vector3(0.8, 2, 0.8))
                    // Function check si joueur dans une zone d'arme sur mur
                    checkPlayerAreaWeapon()
                    // Check hitbox player
                    checkZombieKillPlayer()
                    ////
                    // Gestion du temps de vie des balles, et des impacts
                    ////
                    for(let i = 0; i < bullets.length; i++){
                        if(bullets[i].alive == false){
                            bullets.splice(i, 1)
                            continue
                        }
                        physicsWorld.contactTest( bullets[i].userData.physicsBody , cbContactResult );
                    }
                    //////
                    // POV
                    //////
                    fpsControls.update(deltaTime)
                    ////
                    // Affichage de l'arme, en fonction de la visée
                    ////
                    let actualWeaponAnimate = inventory[indexWeapon] // Dernier élément de la liste
                    // On récupère l'objet mesh de l'arme, pour pouvoir modifier sa position, rotation...
                    scene.traverse( function( object ) {
                        if(object.isObject3D && object.name == actualWeaponAnimate){
                            weaponActuel = object
                        }
                    });
                    // Movement
                    let time = Date.now() * 0.0005
                    if(zoomView == 'not-aim'){      // Vue normal
                        // Vision gun : Position
                        weaponActuel.position.set(
                            camera.position.x - Math.sin(camera.rotation.y - Math.PI/6) * 0.6,
                            camera.position.y - 0.2 + Math.sin(time*4)*0.01,
                            camera.position.z - Math.cos(camera.rotation.y - Math.PI/6) * 0.6
                        )
                        // Rotation
                        weaponActuel.rotation.set(
                            camera.rotation.x,
                            camera.rotation.y + Math.PI,
                            camera.rotation.z,
                        )
                    } else {                        // Vue visé
                        // Vision gun : Position
                        weaponActuel.position.set(
                            camera.position.x - Math.sin(camera.rotation.y) * 0.6,
                            camera.position.y - weapons[actualWeaponAnimate].parameters.positionAimY,    // Position en fonction de l'arme
                            camera.position.z - Math.cos(camera.rotation.y) * 0.6
                        )
                        // Rotation
                        weaponActuel.rotation.set(
                            camera.rotation.x,
                            camera.rotation.y + Math.PI,
                            camera.rotation.z
                        )
                    }
                };
            }
            // AmmoJs : update la partie physic du jeu
            function updatePhysics(deltaTime){
                // Step world
                physicsWorld.stepSimulation( deltaTime, 10 );
                // Update rigid bodies
                for ( let i = 0; i < rigidBodies.length; i++ ) {
                    let objThree = rigidBodies[ i ];
                    let objAmmo = objThree.userData.physicsBody;
                    let ms = objAmmo.getMotionState();
                    // Pas capté
                    if ( ms ) {
                        ms.getWorldTransform( tmpTrans );
                        let p = tmpTrans.getOrigin();
                        let q = tmpTrans.getRotation();
                        objThree.position.set( p.x(), p.y(), p.z() );
                        objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );
                    }
                    // Rotation et déplacement des zombies
                    if(rigidBodies[i].userData.tag == 'targetItem_zombie' && rigidBodies[i].userData.remainLife > 0){
                        // Position de la camera, l'endroit vers où le zombie regarde
                        let camPosX = camera.position.x
                        let camPosY = camera.position.y/2
                        let camPosZ = camera.position.z
                        rigidBodies[i].lookAt(camPosX, camPosY, camPosZ)
                        // 'Vitesse' du vecteur de direction
                        let scalingFactor = 1;
                        // Met à jour la position du zombie
                        rigidBodies[i].updateMatrixWorld();
                        let zombPosX = rigidBodies[i].matrixWorld.elements[12]  // Coord X
                        let zombPosZ = rigidBodies[i].matrixWorld.elements[14]  // Coord Z
                        // Différence entre les 2 objects
                        let diffX = camPosX - zombPosX
                        let diffZ = camPosZ - zombPosZ
                        // Distance de déplacement
                        let moveX
                        let moveZ
                        // Déplace dans une direction, en fonction de la position du zomb et de la cam
                        if(diffX > 0.1){ moveX = 0.85 } else if (diffX < -0.1){ moveX = -0.85 } else { moveX = 0 }
                        if(diffZ > 0.1){ moveZ = 0.85 } else if (diffZ < -0.1){ moveZ = -0.85 } else { moveZ = 0 }
                        // Si zombie sur la cam, on fait rien
                        if( moveX == 0 && moveZ == 0) return;
                        // Sinon vecteur dans la direction
                        let resultantImpulse = new Ammo.btVector3( moveX, 0 , moveZ )
                        resultantImpulse.op_mul(scalingFactor);
                        // Assignation vecteur pour déplacement
                        let physicsBody = rigidBodies[i].userData.physicsBody;
                        // Collé au sol
                        physicsBody.threeObject.position.y = 0
                        // Ajout le vecteur de déplacement
                        physicsBody.setLinearVelocity( resultantImpulse )
                        /////////////////////
                        // ---------------DéplacementBOX3
                        if(rigidBodies[i].userData.remainLife > 0){
                            const zombieArea = zombieKillArea.find((obj) => obj[1] === rigidBodies[i].uuid);
                            zombieArea[0].setFromCenterAndSize(rigidBodies[i].position, new THREE.Vector3(1, 2, 1))
                        }
                    }
                    // Rotation et déplacement de la hit box : sur la position du joueur
                    if(rigidBodies[i].userData.tag == 'player_hitbox'){
                        // Position de la camera, l'endroit vers où le zombie regarde
                        rigidBodies[i].rotation.set(
                            0,
                            camera.rotation.y,
                            0,
                        )

                        rigidBodies[i].position.set(
                            camera.position.x + 2,
                            camera.position.y,
                            camera.position.z,
                        )
                    }
                }
            };

            // Fonction qui check si le joueur esr dans une zone, pour achter arme sur mur
            function checkPlayerAreaWeapon(){
                actualWeaponWall = null
                // On prend la liste des zones d'armes
                weaponWallArea.forEach((data) => {
                    // Si le joueur est dans une zone, on eventBus pour afficher message achat
                    if(data[0].intersectsBox(hitboxPlayer)){
                        actualWeaponWall = data[1]
                        const weapon = inventory.find((weapon) => weapon == actualWeaponWall);
                        let type = (weapon === undefined ? "l'arme" : "des munitions")
                        // JSON envoyé à l'affichage
                        let dataSend = {"weapon": data[1], "price": weapons[data[1]].price, "type": type}
                        eventBus.emit("inAreaWeaponWall", dataSend)
                    }
                })
            }
            // Check si un zombie est sur le joueur ? = Mort
            function checkZombieKillPlayer(){
                zombieKillArea.forEach((data) => {
                    if(data[0].intersectsBox(hitboxPlayer)){
                        death()
                    }
                })
            }
            // Si le joueur est dans la lave
            function checkPlayerInLava(){
                let startTime = Date.now(); 
                // Toutes les 100ms, on check si le joueur est dans la lave, si oui on incrementre le chrono, sinon chrono = 0
                playerInLavaInterval = setInterval(function() {
                    if(gameStop || !player.alive ){
                        document.getElementById("inLavaId").classList.remove("in-lava-animation")
                        startTime = Date.now();
                    } else {
                        if(lavaArea.intersectsBox(hitboxPlayer)){
                            inLavaTimer = Date.now() - startTime;
                        } else {
                            startTime = Date.now();
                            inLavaTimer = 0
                        }
                        // Animation quand sur la lave : css (flou et rouge ?) et playerSpeed --
                        if(inLavaTimer > 0){
                            document.getElementById("inLavaId").classList.add("in-lava-animation")
                            player.speed = 4
                        } else {
                            document.getElementById("inLavaId").classList.remove("in-lava-animation")
                            player.speed = 7
                        }
                        // Si dans la lave plus de 3.3 secondes : mort
                        if(inLavaTimer > 3300){
                            death()
                        }
                    }
                }, 100);
            }
            // Mort du joueur
            function death(){
                player.alive = false
                eventBus.emit("playerDeath")
            }

            ///////////////////////////////////////////////////////////
            // Class controle POV
            const KEYS = {
                'z': 90,
                's': 83,
                'q': 81,
                'd': 68,
            };

            function clamp(x, a, b) {
                return Math.min(Math.max(x, a), b);
            }

            class InputController {
                constructor(target) {
                    this.target_ = target || document;
                    this.initialize_();
                }

                initialize_() {
                    this.current_ = {
                    mouseXDelta: 0,
                    mouseYDelta: 0,
                    mouseX: 0,
                    mouseY: 0,
                    };
                    this.previous_ = null;
                    this.keys_ = {};
                    this.previousKeys_ = {};
                    this.target_.addEventListener('mousemove', (e) => this.onMouseMove_(e), false);
                    this.target_.addEventListener('keydown', (e) => this.onKeyDown_(e), false);
                    this.target_.addEventListener('keyup', (e) => this.onKeyUp_(e), false);
                }

                onMouseMove_(e) {
                    this.current_.mouseX = e.pageX - window.innerWidth / 2;
                    this.current_.mouseY = e.pageY - window.innerHeight / 2;

                    if (this.previous_ === null) {
                    this.previous_ = {...this.current_};
                    }

                    this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
                    this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;
                }

                onKeyDown_(e) {
                    this.keys_[e.keyCode] = true;
                }

                onKeyUp_(e) {
                    this.keys_[e.keyCode] = false;
                }

                key(keyCode) {
                    return !!this.keys_[keyCode];
                }

                update(_) {
                    if (this.previous_ !== null) {
                    this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
                    this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;

                    this.previous_ = {...this.current_};
                    }
                }
            };

            class FirstPersonCamera {
                constructor(camera) {
                    this.camera_ = camera;
                    this.input_ = new InputController();
                    this.rotation_ = new THREE.Quaternion();
                    this.translation_ = new THREE.Vector3(0, 2, 0);
                    this.phi_ = 0;
                    this.phiSpeed_ = 8;
                    this.theta_ = 0;
                    this.thetaSpeed_ = 5;
                    this.playerSpeed = 7
                    this.velocity_y = 0
                    this.playerCanJump = true
                    this.clock = new THREE.Clock()
                    this.deltaTime = null
                }

                update(timeElapsedS) {
                    this.updateRotation_(timeElapsedS);
                    this.updateCamera_(timeElapsedS);
                    this.updateTranslation_(timeElapsedS);
                    this.input_.update(timeElapsedS);
                }

                updateCamera_(_) {
                    this.camera_.quaternion.copy(this.rotation_);
                    this.camera_.position.copy(this.translation_);

                    let deltaTime = 0.0165
                    // Snike : accroupi
                    if(this.input_.key(20)){
                        this.camera_.position.y = 1
                    }
                    // Space : jump !
                    if (this.input_.key(32) && this.playerCanJump) {
                        this.playerCanJump = false
                        this.velocity_y = 100;
                        this.camera_.position.y+=(this.velocity_y/2)*deltaTime;
                    }
                    this.camera_.position.y+=this.velocity_y*deltaTime;
                    if(!this.playerCanJump){
                        this.velocity_y-=9.8*30*deltaTime;
                        if(this.camera_.position.y<=1.8){
                            this.playerCanJump = true
                            this.velocity_y=0;
                            this.camera_.position.y= 1.8;
                        }
                    }
                    const forward = new THREE.Vector3(0, 0, -1);
                    forward.applyQuaternion(this.rotation_);

                    const dir = forward.clone();

                    forward.multiplyScalar(100);
                    forward.add(this.translation_);

                    let closest = forward;
                    const result = new THREE.Vector3();
                    const ray = new THREE.Ray(this.translation_, dir);

                    this.camera_.lookAt(closest);
                }

                updateTranslation_(timeElapsedS) {
                    const forwardVelocity = (this.input_.key(KEYS.z) ? 1 : 0) + (this.input_.key(KEYS.s) ? -1 : 0)
                    const strafeVelocity = (this.input_.key(KEYS.q) ? 1 : 0) + (this.input_.key(KEYS.d) ? -1 : 0)

                    const qx = new THREE.Quaternion();
                    qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);

                    const forward = new THREE.Vector3(0, 0, -1);
                    forward.applyQuaternion(qx);
                    forward.multiplyScalar(forwardVelocity * timeElapsedS * this.playerSpeed);

                    const left = new THREE.Vector3(-1, 0, 0);
                    left.applyQuaternion(qx);
                    left.multiplyScalar(strafeVelocity * timeElapsedS * this.playerSpeed);

                    this.translation_.add(forward);
                    this.translation_.add(left);
                }

                updateRotation_(timeElapsedS) {
                    const xh = this.input_.current_.mouseXDelta / window.innerWidth;
                    const yh = this.input_.current_.mouseYDelta / window.innerHeight;

                    this.phi_ += -xh * this.phiSpeed_;
                    this.theta_ = clamp(this.theta_ + -yh * this.thetaSpeed_, -Math.PI / 2, Math.PI / 2);

                    const qx = new THREE.Quaternion();
                    qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
                    const qz = new THREE.Quaternion();
                    qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta_);

                    const q = new THREE.Quaternion();
                    q.multiply(qx);
                    q.multiply(qz);

                    this.rotation_.copy(q);
                }
            }

        },
        data(){
            return {
                // Variables déclarées ici pour être envoyé en tant que props, dans un component
                player: {height: 1.8, canShoot: true, canJump: true, speed: 0.065, turnSpeed: Math.PI*0.02, alive: true, weapon: 'pistolSilencer', weaponMesh: null},
                viseur: '',         // Change la couleur du viseur
                score: 0,                   // Score du jeu
                remainBullets: 0,
                remainLoaders: 0,
                loader: 0,
                isSound: [false],
            }
        },
    };
</script>


<style>
.scene{
    height: 100vh;
    width: 100vw;
    cursor: none;
    position: relative;
}
/* Menu changement couleur */
.menu-color{
    width: auto !important;
    height: auto;
    background-color: rgba(69, 69, 69, 0.557);
    border-radius: 5px;
    position:absolute;
    top:10px;
    left:10px;
}.menu-color:hover{
    cursor: pointer;
    background-color: red;
}
/* Couleurs pour le viseur */
.color{
    width: 20px;
    height: 20px;
    color: grey;
}.white{
    background-color: white;
}.red{
    background-color: red;
}.yellow{
    background-color: yellow;
}.green{
    background-color: green;
}.blue{
    background-color: blue;
}.purple{
    background-color: purple;
}.black{
    background-color: black;
}
/* Viseur */
.viseur{
    position:absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
}.icon-viseur{
    height: 40px;
    width: 40px;
}
/* Affichage score */
.menu-score{
    width: auto !important;
    height: auto;
    background-color: rgba(69, 69, 69, 0.557);
    border-radius: 5px;
    position:absolute;
    left:30vw;
    right: 30vw;
    color: white;
}
/* Affichage chargeur */
.display-component{
    position:absolute;
}
/* Animation dans la lave */
.in-lava-animation{    
    animation-name: lavaEffect;
    animation-iteration-count: infinite;
    transition: none;
    animation-duration: 3.3s;
}@keyframes lavaEffect {
  0% {
    filter: blur(0px); 
  }
  19% {
    filter: blur(5px); 
    }
  38% {
    filter: blur(1px); 
    }
  57% {
    filter: blur(7.5px); 
    }
  76% {
    filter: blur(3px); 
    }
  90% {
    filter: blur(5px);
  }
  100% { 
    filter: blur(10px);
    }
}

</style>
