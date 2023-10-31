<template>
  <v-app>
    <v-app-bar image="/assets/banner.png">
      <img src="/assets/logo-large.png" alt="Logo" class="wmo-logo" />
  
      <template v-slot:image>
        <!-- Gradient from white to transparent, ensuring at all sizes the blue logo
        will be on a solid background as required by the WMO -->
        <v-img gradient="to left, transparent, #FFFFFF"></v-img>
      </template>
  
      <v-app-bar-title class="wis2-title"> WIS2 Downloader
      </v-app-bar-title>
  
    </v-app-bar>
  </v-app>
</template>

<script setup>

import { VApp, VAppBar, VImg } from 'vuetify/lib/components/index.mjs';

</script>

<style scoped>
.bar-sizing {
  padding: 5px;
}

.wmo-logo {
  height: 60px;
  margin-left: 10px;
}

.wis2-title {
  color: #003DA5;
  font-size: 2rem;
  font-weight: 300;
}

.left-chevron {
  justify-content: center;
}

.right-chevron {
  justify-content: flex-end;
  padding-right: 5px;
}
</style>
