(function() {  
  var Page = require('../helper/page.js');
  var LoginPage = require('../pages/login.page.js');

  var AdminPage = function(baseUrl) {
    this.baseUrl = baseUrl;
    this.path = 'index.php/settings/admin';
    this.url = baseUrl + this.path;

    this.allowLinksCheckBox = element(by.id('allowLinks'));
    this.submitFilesSettings = element(by.id('submitFilesAdminSettings'));
  };

  AdminPage.prototype.get = function() {
    browser.get(this.url);

    var submit = this.submitFilesSettings;
    browser.wait(function() {
      return submit.isDisplayed();
    }, 5000, 'load files content');
  }

  AdminPage.prototype.disableLinks = function() {
    this.allowLinksCheckBox.click();
  }

  module.exports = AdminPage;
})();