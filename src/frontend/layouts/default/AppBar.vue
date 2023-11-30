<template>
  <v-app-bar class="draggable" color="#14418F">
    

    <template v-slot:prepend>
      <a href="https://docs.wis2box.wis.wmo.int/en/latest/" target="_blank"><img src="/assets/logo-white.png" alt="Logo" class="wmo-logo" /></a>
      <v-btn exact to="/" class="explore-button" color="white" prepend-icon="mdi-cloud-search">Explore</v-btn>
      <v-btn exact to="/configure" class="configure-button" color="white" prepend-icon="mdi-account">Configure</v-btn>
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

.configure-button {
  -webkit-app-region: no-drag;
}

.explore-button {
  -webkit-app-region: no-drag;
  margin-left: 15px;
}

.draggable {
  -webkit-app-region: drag;
}
</style>
