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

Firstly, the Vue 3 frontend should be built using

```
npm run build
```

Then, we can Electron Forge's `make` command to package the application

```
npm run make
```