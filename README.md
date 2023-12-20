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

To package for Linux on a Windows computer, you will need to use WSL and the Ubuntu terminal.

Firstly, create a user and password in the Ubuntu terminal.

Then, update the environment with the relevant packages:

```
sudo apt update -y
sudo apt full-upgrade -y
sudo apt install nodejs npm
sudo npm install -g @electron-forge/cli
```

Update npm to version 14:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
nvm install 14
nvm use 14

```

Next, the Ubuntu environment needs to have the correct permissions on the C:/ drive. This can be done with the following commands:

```
sudo umount /mnt/c {USER}
sudo mount -t drvfs C: /mnt/c -o metadata,uid=1000,gid=1000,umask=22,fmask=111
```

Finally, navigate to the application directory, install the dependencies, and build the application:

```
cd /mnt/c/Users/USER/.../wis2-downloader
npm install
npm run make
```

This will create the application in the `out/wis2-downloader-linux-x64` folder.