<script setup>
    const sight = new URL('../../assets/Icons/crosshair3.png', import.meta.url).href
</script>
<template>
    <div class="div-display d-flex align-center justify-center">
        <div id="sight" class="">
            <v-img class="sight-img" :src="sight"></v-img>
        </div>
        <div id="top-left" class="div-quart"></div>
        <div id="top-right" class="div-quart"></div>
        <div id="bottom-left" class="div-quart">
            <div id="rounds" class="d-flex">
                <v-img id="round-img-d" src="../"></v-img>
                <v-img id="round-img-u" src="../"></v-img>
            </div>
        </div>
        <div id="bottom-right" class="div-quart d-flex">
            <div id="bullets" class="d-flex align-center justify-center flex-column">
                <div class="">
                    <p id="weapon-name">Weapon name</p>
                </div>
                <div class="d-flex align-center justify-center">
                    <div class="d-flex">
                        <v-progress-linear id="progress-linear-bullet" class="progress-linear mx-2" model-value="67"></v-progress-linear>
                    </div>
                    <div class="d-flex">
                        <p id="bullet-in-magazine">15</p>
                        <p>/</p>
                        <p id="bullet-all-magazines">60</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    components: {

    },
    created(){

    },
    mounted() {

    },
    data(){
        return {
        }
    },
};
</script>


<style>
/* Div principal */
.div-display{
    position: absolute;
    height: 100vh;
    width: 100vw;
    z-index: 10;
}
/* Crosshair */
#sight{
    position: absolute;
    visibility: hidden;
}.sight-img{
    height: 40px;
    width: 40px;
}
/* Parts */
.div-quart{
    position: absolute;
    height: 50vh;
    width: 50vw;
}#top-left{
    top: 0;
    left: 0;
}#top-right{
    top: 0;
    right: 0;
}#bottom-left{
    bottom: 0;
    left: 0;
}#bottom-right{
    bottom: 0;
    right: 0;
}
/* Rounds */
#rounds{
    position: absolute;
    bottom: 0;
    left: 0;
    height: 100px;
    width: 150px;
    visibility: hidden;
}#round-img-d{
    height: 100px;
    width: 75px;
}#round-img-u{
    height: 100px;
    width: 75px;
}
/* Bullets */
#bullets{
    position: absolute;
    bottom: 0;
    right: 0;
    height: 100px;
    width: 150px;
    color: white;
    font-size: 2vw;
    font-weight: lighter;
    font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
    visibility: hidden;
    transform: skew(-20
    deg, 0deg);
}.progress-linear{
    height: 30px !important;
    width: 30px !important;
    rotate: -90deg;
    transform: translateX(0) !important;
    right: 0 !important;
    left: 0 !important;
}


</style>
