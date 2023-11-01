<template>
  <v-app-bar image="/assets/banner.png">
    <img src="/assets/logo-large.png" alt="Logo" class="wmo-logo" />

    <template v-slot:append>
      <v-btn color="white" append-icon="mdi-account">Log In</v-btn>
      <v-btn color="white" append-icon="mdi-cloud-search">Explore</v-btn>
    </template>

  </v-app-bar>
</template>

<script setup>

import { VAppBar, VBtn } from 'vuetify/lib/components/index.mjs';

</script>

<style scoped>
.bar-sizing {
  padding: 5px;
}

.wmo-logo {
  height: 60px;
  margin-left: 10px;
}


.left-chevron {
  justify-content: center;
}

.right-chevron {
  justify-content: flex-end;
  padding-right: 5px;
}
</style>
