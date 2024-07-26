<a name="readme-top"></a>
![rounded-toolbar](https://github.com/user-attachments/assets/6b62a099-d346-48ed-921d-e1c1263950d1)

# The WIS2 Subscription Manager
### The desktop application for managing your WIS2 Downloader

<a href="https://github.com/wmo-im/wis2-subscription-manager/blob/main/LICENSE" alt="License" ><img src="https://img.shields.io/badge/License-Apache_2.0-blue"></img></a>

The WIS2 Subscription Manager is an Electron application that allows you to easily maintain your on-going subscriptions, as well as explore new topics of interest on a Global Discovery Catalogue.

**Note**: This repository does *not* contain the downloader which actually enables the subscription process. <a href="https://github.com/wmo-im/wis2downloader">The WIS2 Downloader can be found here.</a>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#features">Features</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#examples">Examples</a></li>
      </ul>
    </li>
    <li><a href="#demos">Demos</a>
      <ul>
        <li><a href="#adding-and-configuring-topics">Adding and Configuring Topics</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#1-download">Download</a></li>
        <li><a href="#2-install">Extract and Install</a></li>
      </ul>
    </li>
    <li>
      <a href="#development">Development</a>
      <ul>
        <li><a href="#how-to-run-the-application">How to run the application</a></li>
        <li><a href="#how-to-package-the-application">How to package the application</a></li>
        <li><a href="#understanding-the-structure-of-this-repository">Understanding the structure of this repository</a></li>
      </ul>
    </li>
    <li><a href="#bugs-and-issues">Bugs and Issues</a></li>
    <li><a href="#contact">Contract</a></li>
  </ol>
</details>

## Features

- **Configure Your Subscriptions**: Easily view and configure topics through a user-friendly interface, built with <a href="https://vuetifyjs.com/en/">Vuetify 3</a>.
- **Explore the Global Discovery Catalogue (GDC)**: Browse a GDC of your choice and seamlessly add new topics to your subscription.
- **Visualize Download Metrics**: Just click on a subscribed topic to see the number of files/bytes downloaded, file types, and failed downloads.

### Built With
  * [![Vue][Vue.js]][Vue-url]
  * [![Vuetify][Vuetify3]][Vuetify-url]
  * [![Electron][Electron]][Electron-url]

### Examples
<div align="center">
    <img src="https://github.com/user-attachments/assets/a2dc40d1-5790-4181-a7f1-f54eea6e980d" style="width:400px"/>
    <img src="https://github.com/user-attachments/assets/c763f38a-e79d-4f05-abc4-6e8333d68c7c" style="width:400px"/>
</div>

<br/>

<div align="center">
    <img src="https://github.com/wmo-im/wis2-subscription-manager/assets/47696929/85ffd7ae-cf50-4bd0-87bd-450bd3e38247" style="width:400px"/>
    <img src="https://github.com/wmo-im/wis2-subscription-manager/assets/47696929/f7972cb0-a2e1-4e3d-8c65-7ec5cb56f8e2" style="width:400px"/>
</div>

## Getting Started

### 1. Download
In the <a href="https://github.com/wmo-im/wis2-subscription-manager/releases">releases section</a>, expand the 'Assets' drop-down and download the zip file for your operating system.

### 2. Install
Extract this folder and double click on the install file. This should open the application and you're ready to go.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---
***Note**: Currently, the application has not yet been code-signed, as we are still in the alpha phase of development.*

*Due to this, there may be a pop-up warning on installation that asks if you want to continue. In the case of the Microsoft Defender SmartScreen warning, you can proceed with installation simply by clicking 'More Info' and 'Run Anyway'.*

---

## Development

### How to run the application

Firstly, clone this repository to your local directory

```
git clone https://github.com/wmo-im/wis2-subscription-manager
```

In this directory, install the required libraries with `npm`:

```
npm install
```

Lastly, to start the application

```
npm run start
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### How to package the application
This is already done automatically by the GitHub Actions workflow when there is a push to the main branch. If you want to test this locally however, please see the instructions below.

#### Windows

Firstly, the Vue 3 frontend should be built using

```
npm run build
```

Then, we can Electron Forge's `make` command to package the application which will use the built frontend

```
npm run make
```

This will create the application installer (`.exe`) in the `out/make/squirrel.windows/x64` folder.

#### Linux

To package this application for Linux on a Windows computer, you will need to use a WSL (Windows Subsystem for Linux) environment, which can be downloaded from the [Microsoft Store](https://apps.microsoft.com/detail/9pn20msr04dw?hl=en-US&gl=US).

Inside this environment, you can run the same commands as you would when making the Windows application.

*(Note: Ensure you are working on a new git clone of this repository, as the Windows `node_modules` folder may conflict with the Linux version, and vice versa.)*

This will create the application installer (`.deb`) in the `out/make/deb/x64` folder in your project root.

#### MacOS

It is not recommend to use a virtual machine to package this application for MacOS, as there will likely be compatibility issues. We recommend to run the commands on a genuine Macbook.

The only difference here is the application must be made for both the x64 and arm64 architectures, the latter of which is used by the Apple silicon chips (M1 and above). This is done by running:
```
npm run make -- --arch=universal --platform=darwin
```

This will create the application installer (`.dmg`) in the `out/make` folder.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Understanding the structure of this repository
Since this application requires an intersection of Vue/Vuetify 3 and Electron, it's important to organise their usage in order to prevent confusion. For this reason, they exist primarily in separate folders:
- **`src/frontend`**: This folder contains the folders and files you'd typically see in a Vite project, with the exception of the `main.js` file (see below).
- **`src/main`**: This folder contains the core ElectronJS files, one of which is `renderer.js` which replaces the `main.js` you normally find in a Vite project. To clarify, the `main.js` file in this folder is that of Electron, **not** Vue 3.

Let's explain this in more detail:

#### Frontend files
This is where the Vue 3 files are stored, structured in a way very similar to that of the wis2box-webapp. This section is pretty intuitive, with the exception of the following:

- `main.js` is not found here, but is rather stored in `src/main` named as `renderer.js` instead.
- `vite.config.js` is not found here, but is rather stored in the root folder and is partitioned into three separate files: `vite.main.config.mjs`, `vite.preload.config.mjs`, and `vite.renderer.config.mjs`. This is required in order to integrate the frontend into the packaged application. *(Note: For this reason, `npm run build` is actually running three simultaneous build processes.)*

#### Main Files
This is where the two key Electron files are stored: `main.js` and `preload.js`. The third file is the `renderer.js` file mentioned above. This two files serve the following roles:

- `main.js`: The entry point of the appliation. It controls the behaviour of the browser window and can access the computer it's running on. This means *handlers* can be written to perform important system events, such as opening the 'Choose a folder' window and reading/writing local files.
- `preload.js`: This script runs before the web page is loaded into the renderer process. It serves as the bridge between the Electron application and the Vue 3 frontend. Most notably, it allows you to safely expose the handlers written in `main.js` to the frontend, without exposing the entire Node.js API, so that they can be called in Vue components using `window.electronAPI.{handlerName}`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Bugs and Issues

All bugs, enhancements and issues are managed on [GitHub](https://github.com/wmo-im/wis2-subscription-manager/issues).

## Contact

* [Rory Burke](https://github.com/RoryPTB)
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LINKS AND IMAGES -->

<!-- Technologies -->
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Vuetify3]: https://img.shields.io/badge/Vuetify%203-E3F2FD?style=for-the-badge&logo=vuetify&logoColor=2196F3
[Vuetify-url]: https://vuetifyjs.com/en/
[Electron]: https://img.shields.io/badge/Electron-1b1c26?style=for-the-badge&logo=electron&logoColor=9feaf9
[Electron-url]: https://www.electronjs.org/
