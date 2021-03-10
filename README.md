# file-transfer-app
![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/legendword/file-transfer-app?include_prereleases)
![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/downloads-pre/legendword/file-transfer-app/latest/total)
![GitHub](https://img.shields.io/github/license/legendword/file-transfer-app)
![GitHub commits since latest release (by date including pre-releases)](https://img.shields.io/github/commits-since/legendword/file-transfer-app/latest?include_prereleases)

Legendword File Transfer desktop application built with Electron.

## Description
This project corresponds to the web application [Legendword File Transfer](https://legendword.com/s/transfer). Built with [Electron](https://www.electronjs.org/), it is a simple desktop application that provides the same upload/download functionality as the website.

## Using the Application
Download the installation package from one of the [releases](https://github.com/legendword/file-transfer-app/releases) and install. The app has an very simple and intuitive interface that does not require additional explanation.

You can upload file (within a certain size limit) temporarily to the server and receive a four-digit code. This code can then be used to download the file from anywhere using the Legendword File Transfer website or desktop application. The code will be invalid and the file will be deleted once a download has finished.

## Code Structure
```
- index.html [Main file for HTML layout]
- main.css [Main CSS]
- main.js [Handles app windows and layouts; Main]
- ui.js [Handles rendering & api calling; Renderer]
```
