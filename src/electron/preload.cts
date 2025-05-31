const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electron', {
  subscibeStatistics: (callback: (statistics: any) => void) => callback({}),
  getStaticData: () => console.log('static')
});
