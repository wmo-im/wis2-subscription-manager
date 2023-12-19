module.exports = {
  packagerConfig: {
    // Point to Electron entry file main.js
    entry: 'src/main/main.js',
    // `asar` is used to improve the read performance of packaged Electron applications.
    // It archives files into a single file, similar to tar or zip, but optimized for random access.
    // The `unpack` option specifies files or directories to exclude from the ASAR archive.
    // These files will be copied to the app's resources directory instead.
    asar: {
      unpack: "backend/**/*|src/frontend/**/*|src/main/**/*|public/assets/**/*"
    },
    icon: 'public/assets/logo-small.png'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
        // If you are familiar with Vite configuration, it will look really familiar.
        build: [
          {
            // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
            entry: 'src/main/main.js',
            config: 'vite.main.config.mjs',
          },
          {
            entry: 'src/main/preload.js',
            config: 'vite.preload.config.mjs',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.mjs',
          },
        ],
      },
    },
  ],
};
