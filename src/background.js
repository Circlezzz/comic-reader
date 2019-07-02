'use strict'

import { app, protocol, BrowserWindow } from 'electron';
import {
  createProtocol,
  installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib';

const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;
var path = require('path');
var fs = require("fs");
var unrar = require("node-unrar-js");
const archiveType = require('archive-type');
const readChunk = require('read-chunk');

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800, height: 600, webPreferences: {
      nodeIntegration: true
    }
  })

  win.setMenu(null);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

ipc.on('open-file-dialog', function (event, emitter) {
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Comic File', extensions: ['cbr', 'cbz'] },
    ]
  }, function (files) {
    if (files) {
      // loads and parses existing zip file local_file.zip
      const header = readChunk.sync(files[0], 0, 262);
      // console.log(archiveType(header));
      var buffer = [];

      switch (archiveType(header).ext) {

        case 'rar':
          var extractor = unrar.createExtractorFromData(fs.readFileSync(files[0]));

          var extracted = extractor.extractAll();

          // var filelist=extracted[1].files;
          // {name,ext,data}
          extracted[1].files.forEach(function (file) {
            var extname = path.extname(file.fileHeader.name);
            if (extname.toLowerCase() === '.jpg' || extname.toLowerCase() === '.png' || extname.toLowerCase() === '.jpeg') {
              var name = path.basename(file.fileHeader.name, extname);
              var filedata = {};
              filedata['name'] = name.toLowerCase();
              filedata['ext'] = extname.toLowerCase();
              filedata['data'] = file.extract[1];
              buffer.push(filedata);
            }
          });
          break;

        case 'zip':
          var zip = new Zip(files[0]);
          // get all entries and iterate them
          zip.getEntries().forEach(function (entry) {
            var entryName = entry.entryName;
            var extname = path.extname(entryName);
            if (extname.toLowerCase() === '.jpg' || extname.toLowerCase() === '.png' || extname.toLowerCase() === '.jpeg') {
              var name = path.basename(entryName, extname);
              var decompressedData = zip.readFile(entry); // decompressed buffer of the entry
              var filedata = {};
              filedata['name'] = name.toLowerCase();
              filedata['ext'] = extname.toLowerCase();
              filedata['data'] = decompressedData;
              buffer.push(filedata);
            }
          });
          break;
        case 'tar':

          break;

      }
      if (emitter === 'Index.vue') {
        event.reply('new-image-buffer-index', buffer);
      } else {
        event.reply('new-image-buffer-comic', buffer);
      }
    }
  })
})

ipc.on('returnHome', function (event) {
  event.reply('redirectToHome');
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installVueDevtools()
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
