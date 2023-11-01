<template>
  <v-app>
    <default-bar />
    <default-view />
  </v-app>
</template>

<script setup>
  import { VApp } from 'vuetify/lib/components/index.mjs';
  import DefaultBar from '@/layouts/default/AppBar.vue'
  import DefaultView from '@/layouts/default/View.vue'
</script>
