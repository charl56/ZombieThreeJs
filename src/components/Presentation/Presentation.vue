<template>  
    <div class="div-presentation">
        <div class="mt-10">
            <p class="text-h5 mb-1">Bienvenue</p>
        </div>
        <div class="mt-10">
            <p class="txt-h6 my-1 text-center">En cours de dev, donc il reste pas mal de points à améliorer, de bug à corriger...</p>
            <p class="txt-h6 mx-1 text-center">Passez en mode plein écran (F11) avant de commencer</p>
        </div>
        <div class="mt-10">
            <p class="txt-h6 my-1 text-center">ZQSD pour se déplacer</p>
            <p class="txt-h6 my-1 text-center">Espace pour sauter</p>
            <p class="txt-h6 my-1 text-center">VerMaj pour se baisser</p>
            <p class="txt-h6 my-1 text-center">Maj pour sprinter</p>
            <p class="txt-h6 my-1 text-center">Entré pour activer les bruits</p>
        </div>
        <div class="mt-10">
            <p class="txt-h6 my-1 text-center">Touche "P" pour mettre a pause pendant la partie</p>
            <p class="txt-h6 mx-1 text-center">Si lors d'une partie un ou plusieurs zombie(s) est/sont immortel(s), tuez les autres puis appuyez sur la touche O pour l'éliminer</p>
        </div>
        <div class="mt-10">
            <v-btn class="btn-restart mx-2" variant="outlined" @click="start()">Commencer</v-btn>
        </div>
    </div>
</template>

<script>
import { eventBus } from '../../plugins/eventBus';

export default {
    name: 'AppPresentation',
    created(){
    },
    mounted(){ // Lance la fonction au chargement de la page
    
    },
    data() {
        return {
            gameStop: false,
            sound: false,
        }
    },
    methods:{
        start(){
            eventBus.emit("startGame")
        },
    },
    computed: {
    }

}
</script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>