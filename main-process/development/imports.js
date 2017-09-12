var path = require('path');
var electron = require('electron');

module.exports = function() {
  console.info('development mode is on');

  var cwd = process.cwd();

  /** crash reporter in development modefor now**/
  var crashReporter = electron.crashReporter;

  crashReporter.start({
    productName: 'soundload',
    companyName: 'soundload inc',
    submitURL: 'http://127.0.0.1:3001/submit',
    uploadToServer: true
  });
  console.log(path.resolve(cwd, 'renderer-process'));
  /** https://github.com/yan-foto/electron-reload - hard reset starts a new process **/
  require('electron-reload')(path.resolve(cwd, 'renderer-process'), {
    electron: require('electron')
  });
}()
