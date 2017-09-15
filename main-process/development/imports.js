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

  /** https://github.com/yan-foto/electron-reload - hard reset starts a new process **/
  require('electron-reload')(cwd, {
    electron: require('electron'),
    ignored: /log.log|node_modules|dist|build|[\/\\]\./
  });
}()
