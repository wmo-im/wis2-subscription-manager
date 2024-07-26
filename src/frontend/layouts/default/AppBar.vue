<template>
  <v-app-bar class="draggable" color="#14418F">
    

    <template v-slot:prepend>
      <!-- On MacOS, the traffic lights will be
      where the logo is. So fill the gap with a blank div -->
      <div class="logo-placeholder">
        <div v-if="isDarwin == false">
          <img src="/assets/logo-white.png" alt="Logo" class="wmo-logo" />
        </div>
      </div>

      <v-btn exact to="/" class="app-button" color="white" prepend-icon="mdi-cloud-search">Explore</v-btn>
      <v-btn exact to="/configure" class="app-button" color="white" prepend-icon="mdi-account">Subscribe</v-btn>
</template>

<template v-slot:append v-if="isDarwin == true">
    <div>
        <img src="/assets/logo-white.png" alt="Logo" class="wmo-logo" />
    </div>
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
  margin-left: 20%;
}

.logo-placeholder {
  width: 100px;
  height: 50px;
}

.app-button {
  -webkit-app-region: no-drag;
  margin-left: 5%;
}

.draggable {
  -webkit-app-region: drag;
}
</style>
