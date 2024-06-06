<template>
  <v-app-bar class="draggable" color="#14418F">
    

    <template v-slot:prepend>
      <!-- On MacOS, the traffic lights will be
      where the logo is. So fill the gap with a blank div -->
      <div class="logo-placeholder">
        <a v-if="isDarwin == false" 
         target="_blank">
          <img src="/assets/logo-white.png" alt="Logo" class="wmo-logo" />
        </a>
      </div>

      <v-btn exact to="/" class="app-button" color="white" prepend-icon="mdi-cloud-search">Explore</v-btn>
      <v-btn exact to="/configure" class="app-button" color="white" prepend-icon="mdi-account">Subscribe</v-btn>
    </template>

    <template v-slot:append v-if="isDarwin == true">
      <a target="_blank">
          <img src="/assets/logo-white.png" alt="Logo" class="wmo-logo" />
      </a>
    </template>

  </v-app-bar>
</template>

<script>

import { defineComponent, ref, onMounted } from 'vue';
import { VAppBar, VBtn } from 'vuetify/lib/components/index.mjs';

export default defineComponent({
  name: 'AppBar',
  components: {
    VAppBar,
    VBtn
  },
  setup() {
    // Reactive variables
    const isDarwin = ref(false);

    // Methods

    // Check if the OS is Darwin
    const checkOS = async () => {
      const platform = await window.electronAPI.getOS();
      console.log(platform)
      isDarwin.value = (platform === 'darwin');
    };

    // Lifecycle hooks
    onMounted(() => {
      checkOS();
    })

    return {
      isDarwin
    }
  }
})

</script>

<style scoped>
.wmo-logo {
  -webkit-app-region: no-drag;
  height: 50px;
}

.logo-placeholder {
  width: 50px;
  height: 50px;
}

.app-button {
  -webkit-app-region: no-drag;
  margin-left: 15px;
}

.draggable {
  -webkit-app-region: drag;
}
</style>
