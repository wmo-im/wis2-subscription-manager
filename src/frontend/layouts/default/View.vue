<template>
  <v-main>
    <v-container fluid>
      <router-view />
    </v-container>
  </v-main>
</template>

<script setup>
  import { VMain, VContainer } from 'vuetify/lib/components/index.mjs';
</script>