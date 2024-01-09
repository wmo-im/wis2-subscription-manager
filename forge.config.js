module.exports = {
  packagerConfig: {
    // Point to Electron entry file main.js
    entry: 'src/main/main.js',
    // ASAR is used to improve the read performance of packaged Electron applications.
    // It archives files into a single file, similar to tar or zip, but optimized for random access.
    // The `unpack` option specifies files or directories to exclude from the ASAR archive.
    // These files will be copied to the app's resources directory instead.
    // NOTE: ASAR should only be used for static files, so the backend folder should be excluded.
    asar: {
      unpack: "src/frontend/**/*|src/main/**/*|public/assets/**/*"
    },
    // Put backend executables into extra resources
    extraResource: [
      'backend', 'backend/configs'
    ],
    icon: 'public/assets/logo-circle.png'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'wis2-downloader',
        authors: 'World Meteorological Organization',
        exe: 'wis2-downloader.exe',
        icon: 'public/assets/logo-circle.ico',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {
        name: 'wis2-downloader',
        icon: 'public/assets/logo-circle.ico',

      },
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
