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

Then, we can Electron Forge's `make` command to package the application

```
npm run make
```

This will create the application in the `out/wis2-downloader-win32-x64` folder.

### Linux

To package for Linux on a Windows computer, you will need to use the Dockerfile included.

Firslty, build the Docker image as follows:

```
docker build -t linux-installer .
```

Then, run the container with bash, mounting your project root directory to the app folder of the container:

```
docker run -it -v ${PWD}:/app linux-installer bash
```

Note: The above is intended for Powershell. The correct syntax of `${PWD}` will vary per console used.

Inside the container, install the dependencies and then run the installer (`make`):

```
npm install
npm run make
```

This will create the application in the `out/wis2-downloader-linux-x64` folder in your project root.