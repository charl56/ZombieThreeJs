<template>
    <div v-if="!playerDeath" class="score d-flex justify-end pb-5 mb-15">
        <p class="text-h6 p-score px-6 py-0 font-weight-bold">{{ score }}</p>
    </div>   
    <div v-else class="death-score mt-7 d-flex align-start justify-center">
        <p class="p-death-score mx-6 px-2 py-0">Vous êtes mort</p>
        <!-- <p class="p-death-score mx-6 px-2 py-0">Score : {{ score }}</p> -->
    </div>  
</template>

<script>
import { eventBus } from '../../../plugins/eventBus';


export default {
    name: 'AppProjetComponent',
    created(){
        eventBus.on("playerDeath", () => {
            this.playerDeath = true
        })
    }
    ,
    props: {
        score: Number,
    },
    mounted(){ // Lance la fonction au chargement de la page
    },
    data () {
        return {
            playerDeath: false
        }
    },
    methods:{

    },
    computed: {
    }

}
</script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.score{
    bottom: 0;
    width: 100%;
}.death-score{
    right: 0;
    bottom: 0;
    position: fixed;
    height: 90%;
    width: 100%;
}
.p-score{
    color: white;
}.p-death-score{
    background-color: rgb(169, 169, 169);
    border-radius: 10px;
    font-size: 200%;
    animation-name: changeSize;
    animation-iteration-count: infinite;
    transition: none;
    animation-duration: 1.5s;
}
@keyframes changeSize {
  0%   { font-size: 200%; }
  40%   { font-size: 220%; }
  100% { font-size: 200%; }
}

</style>