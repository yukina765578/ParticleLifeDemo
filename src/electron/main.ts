import { app, BrowserWindow } from 'electron';
import { isDev } from './util.js';
import { pollResources } from './resourceManager.js';
import { getPreloadPath } from './pathResolver.js';

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    // if you want to use prelaod scripts
    // webPreferences: {
    //   preload: getPreloadPath()
    // },
  });
  if (isDev()) {
    // Load the React app in development mode
    // Load specific PORT
    mainWindow.loadURL("http://localhost:8000");
  } else {
    mainWindow.loadFile(app.getAppPath() + '/dist-react/index.html');
  }

  //pollResources();
})

