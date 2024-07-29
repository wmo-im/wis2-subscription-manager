import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/frontend/styles/settings.scss'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/frontend')
    }
  }
});
