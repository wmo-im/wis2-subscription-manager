module.exports = {
  packagerConfig: {
    // Name of app
    name: 'WIS2 Subscription Manager',
    executableName: 'wis2-subscription-manager',
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
    // Icon for both Windows and MacOS, no file extension needed
    icon: 'public/assets/app-icon'
  },
  rebuildConfig: {},
  makers: [
    // Common maker
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32', 'darwin', 'linux']
    },
    // Windows maker
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: 'World Meteorological Organization',
        iconUrl: 'https://raw.githubusercontent.com/wmo-im/wis2-subscription-manager/main/public/assets/app-icon.ico',
        setupIcon: 'public/assets/app-icon.ico',
        loadingGif: 'public/assets/install-banner.gif'
      },
    },
    // Linux maker
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {
        options: {
          icon: 'public/assets/app-icon.png'
        }
      },
    },
    // MacOS maker
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        icon: 'public/assets/app-icon.icns',
      },
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'wmo-im',
          name: 'wis2-subscription-manager'
        },
        authToken: process.env.GITHUB_TOKEN,
        prerelease: true,
        draft: true,
        generateReleaseNotes: true
      }
    }
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
