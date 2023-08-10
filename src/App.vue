<template>
  <v-app id="app">
      <!-- Jeu -->
      <Game />
  </v-app>
</template>

<script>
import Game from './components/Game/Game.vue'

import { eventBus } from './plugins/eventBus'

export default {
  name: 'App',
  components: {
    Game
  },
}
</script>

<style>
/* Hide scrollbar for Chrome, Safari and Opera */
html::-webkit-scrollbar {
  display: none;
}

html {
  margin: 0;
  height: 100%;
  background-color: #FFF2DC;
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
#app {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #FFF2DC !important;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
/* Surlignage du texte */
::selection{
  background-color: #ebe5dc;
  color: #7eb3e8;
}
::-moz-selection{
  background-color: #ebe5dc;
  color: #2c3e50;
}
</style>