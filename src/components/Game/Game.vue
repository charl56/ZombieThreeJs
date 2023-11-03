<template>
    <div id="container" class="scene" ref="scene" onselectstart="return false" onmousedown="return false">
        <div class="viseur d-flex align-center justify-center">
            <div>
                <v-img class="icon-viseur"></v-img>
            </div>
        </div>
    </div>
</template>

<script>
import { QuickFPS1 } from '../../plugins/game/main';  
import Ammo from 'ammo.js';

export default {
    components: {

    },
    created(){

    },
    async mounted() {
        // App
        let _APP = null;
        new Ammo().then(
            () => {
                _APP = new QuickFPS1();
            }
        )


    },
    data(){
        return {
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
