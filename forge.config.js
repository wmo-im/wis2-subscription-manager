module.exports = {
  packagerConfig: {
    // Name of app
    name: 'WIS2 Downloader',
    executableName: 'WIS2 Downloader',
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
      "./backend/subscribe-backend-win32.exe",
      "./backend/subscribe-backend-linux"
    ],
    icon: 'public/assets/logo-circle'
  },
  rebuildConfig: {},
  makers: [
    // Windows maker
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: 'World Meteorological Organization',
        iconUrl: 'https://raw.githubusercontent.com/wmo-im/wis2-downloader/main/public/assets/logo-circle.ico',
        setupIcon: 'public/assets/logo-circle.ico',
        loadingGif: 'public/assets/wmo-banner.gif'
      },
    },
    // Linux maker
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {
        options: {
          icon: 'public/assets/logo-circle.ico'
        }
      },
    },
    // MacOS maker
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        icon: 'public/assets/logo-circle.icns',
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
