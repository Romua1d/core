(function() {
  var FilesPage = require('../pages/files.page.js');
  var path = require('path');
  
  var Uploader = function() {

  };

  Uploader.prototype.upload = function(pathToFile) {
    var filesPage = new FilesPage();
    var fileToUpload = 'upload_foler/' + pathToFile; // path to file you want to upload
    var absolutePath = path.resolve(__dirname, fileToUpload);

    console.log(absolutePath);
    filesPage.uploadButton.sendKeys(absolutePath);
    browser.sleep(3000);
  };

  module.exports = Uploader;
})();
