<template>
  <v-app>
    <default-bar />
    <!-- Add space after AppBar -->
    <div style="margin-top: 30px;"/>
    <default-view />
    <default-footer />
  </v-app>
</template>

<script setup>
  import DefaultBar from './AppBar.vue'
  import DefaultView from './View.vue'
  import DefaultFooter from './Footer.vue'
</script>
