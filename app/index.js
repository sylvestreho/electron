/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
const electron = require('electron')
const ipcMain = electron.ipcMain
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = require('./menu')
const LocalShortcuts = require('./localShortcuts')

// Report crashes
electron.crashReporter.start()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let windows = []

app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const spawnWindow = () => {
  let mainWindow = new BrowserWindow({
    width: 1360,
    height: 800,
    minWidth: 400
    // Neither a frame nor a titlebar
    // frame: false,
    // A frame but no title bar and windows buttons in titlebar 10.10 OSX and up only?
    // 'title-bar-style': 'hidden'
  })
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('file://' + __dirname + '/index-dev.html')
  } else {
    mainWindow.loadURL('file://' + __dirname + '/index.html')
  }
  mainWindow.on('closed', function () {
    var index = windows.indexOf(mainWindow)
    if (index > -1) {
      windows.splice(index, 1)
    }
  })
  return mainWindow
}

app.on('ready', function () {
  windows.push(spawnWindow())

  ipcMain.on('quit-application', () => {
    app.quit()
  })

  ipcMain.on('new-window', () => windows.push(spawnWindow()))
  process.on('new-window', () => windows.push(spawnWindow()))

  ipcMain.on('close-window', () => BrowserWindow.getFocusedWindow().close())
  process.on('close-window', () => BrowserWindow.getFocusedWindow().close())

  Menu.init()
  LocalShortcuts.init()
})