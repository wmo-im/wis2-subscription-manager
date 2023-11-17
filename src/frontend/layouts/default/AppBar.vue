<template>
  <v-app-bar class="draggable" color="#14418F">
    

    <template v-slot:prepend>
      <a href="https://docs.wis2box.wis.wmo.int/en/latest/" target="_blank"><img src="/assets/logo-white.png" alt="Logo" class="wmo-logo" /></a>
      <v-btn class="login-button" color="white" prepend-icon="mdi-account">Log In</v-btn>
      <v-btn class="explore-button" color="white" prepend-icon="mdi-cloud-search">Explore</v-btn>
    </template>

  </v-app-bar>
</template>

<script setup>

import { VAppBar, VBtn } from 'vuetify/lib/components/index.mjs';

</script>

<style scoped>
.wmo-logo {
  -webkit-app-region: no-drag;
  height: 50px;
}

.login-button {
  -webkit-app-region: no-drag;
  margin-left: 10px;
}

.explore-button {
  -webkit-app-region: no-drag;
}

.draggable {
  -webkit-app-region: drag;
}
</style>
