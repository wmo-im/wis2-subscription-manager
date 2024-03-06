# WIS2 Downloader

This is a standalone application created using Electron, Vite, Vue3, and Vuetify3 that allows a user to:

- Connect to a WIS2 Global Broker
- Explore the Global Discovery Catalogue (GDC)
- Subscribe to topics
- Download the latest data from these topics

## How to Run the Application

Firstly, clone this repository to your local directory

```
git clone https://github.com/wmo-im/wis2-downloader
```

In this directory, install the required libraries with `npm`:

```
npm install
```

Lastly, to start the application

```
npm run start
```

## How to Package the Application

### Windows

Firstly, the Vue 3 frontend should be built using

```
npm run build
```

Then, we can Electron Forge's `make` command to package the application which will use the built frontend

```
npm run make
```

This will create the application installer (`.exe`) in the `out/make/squirrel.windows/x64` folder.

### Linux

To package this application for Linux on a Windows computer, you will need to use a WSL (Windows Subsystem for Linux) environment, which can be downloaded from the [Microsoft Store](https://apps.microsoft.com/detail/9pn20msr04dw?hl=en-US&gl=US).

Inside this environment, you can run the same commands as you would when making the Windows application.

*(Note: Ensure you are working on a new git clone of this repository, as the Windows `node_modules` folder may conflict with the Linux version, and vice versa.)*

This will create the application installer (`.deb`) in the `out/make/deb/x64` folder in your project root.

### MacOS

There is no virtual machine can be trusted to package this application compatibly for a real MacOS system. The best approach is to run the commands on a genuine Macbook.

The only difference here is the application must be made for both the x64 and arm64 architectures, the latter of which is used by the Apple silicon chips (M1 and above). This is done by running:
```
npm run make -- --arch=universal --platform=darwin
```

This will create the application installer (`.dmg`) in the `out/make` folder.

## Understanding the Structure of This Repository
Since this application requires an intersection of Python, Vue/Vuetify 3, and ElectronJS, it's important to organise their usage in order to prevent confusion. For this reason, they exist primarily in separate folders:
- **`backend`**: This folder contains the Python script, subscription configuration files, and the frozen backend files for each OS.
- **`src/frontend`**: This folder contains the folders and files you'd typically see in a Vite project, with the exception of the `main.js` file (see below).
- **`src/main`**: This folder contains the core ElectronJS files, one of which is `renderer.js` which replaces the `main.js` you normally find in a Vite project. To repeat, the `main.js` file in this folder is that of Electron, **not** Vue 3.

Let's explain this in more detail:

### Backend Files
This is where every file for the MQTT subscription and Flask app (adding, removing, listing susbcriptions), as well as additional configurations, are stored. In particular:

- `broker.json`: An updated list of global brokers on the WIS2 network.
- `config.json`: An object with the subscription configuration data chosen by the user in the application which is used by the backend to subscribe accordingly.
- `subscribe-backend-{OS}`: The frozen backend subscriber for each operating system.
- `configs`: A folder containing zero or more named configurations in the form of `config.json` saved by the user for later use.
- `script`: A folder containing the Python script which is used to create the frozen backends mentioned above.

### Frontend Files
This is where the Vue 3 files are stored, structured in a way very similar to that of the wis2box-webapp. This section is pretty intuitive, with the exception of the following:

- `main.js` is not found here, but is rather stored in `src/main` named as `renderer.js` instead.
- `vite.config.js` is not found here, but is rather stored in the root folder and is partitioned into three separate files: `vite.main.config.mjs`, `vite.preload.config.mjs`, and `vite.renderer.config.mjs`. This is required in order to integrate the frontend into the packaged application. *(Note: For this reason, `npm run build` is actually running three simultaneous build processes.)*

### Main Files
This is where the two key Electron files are stored: `main.js` and `preload.js`. The third file is the `renderer.js` file mentioned above. This two files serve the following roles:

- `main.js`: The entry point of the appliation. It controls the behaviour of the browser window and can access the computer it's running on. This means *handlers* can be written to perform important system events, such as opening the 'Choose a folder' window and reading/writing local files.
- `preload.js`: This script runs before the web page is loaded into the renderer process. It serves as the bridge between the Electron application and the Vue 3 frontend. Most notably, it allows you to safely expose the handlers written in `main.js` to the frontend, without exposing the entire Node.js API, so that they can be called in Vue components using `window.electronAPI.{handlerName}`.
