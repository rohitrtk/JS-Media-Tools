const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const TimeStamp = require('./timestamp.js');

let mainWindow = null;
let selectedAudioFile = null;

if (require('electron-squirrel-startup')) { 
  app.quit();
}

const createWindow = () => {
  const windowTitle = `Timestamper | Running NodeJS Version ${process.versions.node}`;

  mainWindow = new BrowserWindow({
    title: windowTitle,
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('select-audio-button-clicked', event => {
  dialog.showOpenDialog({
    title: 'Select audio file',
    properties: ['openFile'],
    filters: [
      { name: 'Audio', extensions: ['mp3', 'wav'] },
      { name: 'All', extensions: ['*'] }
    ]
  })
  .then(selected => {
    if(!selected.canceled) {
      selectedAudioFile = selected.filePaths[0];
      mainWindow.webContents.send('audio-file-selected', selectedAudioFile);

      run();
    }
  })
  .catch(error => console.log(error));
});

ipcMain.on('get-json-button-clicked', event => {

});
