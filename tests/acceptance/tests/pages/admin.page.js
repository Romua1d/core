(function() {  
  var Page = require('../helper/page.js');
  var LoginPage = require('../pages/login.page.js');

  var AdminPage = function(baseUrl) {
    this.baseUrl = baseUrl;
    this.path = 'index.php/settings/admin';
    this.url = baseUrl + this.path;

    this.submitFilesSettings = element(by.id('submitFilesAdminSettings'));
    this.shareAPIEnabledCheckBox = element(by.id('shareAPIEnabled'));
    this.allowLinksCheckBox = element(by.id('allowLinks'));
    this.allowResharingCheckBox = element(by.id('allowResharing'));
    this.enforceLinkPasswordCheckBox = element(by.id('enforceLinkPassword'));
  };

  AdminPage.prototype.get = function() {
    browser.get(this.url);

    var submit = this.submitFilesSettings;
    browser.wait(function() {
      return submit.isDisplayed();
    }, 5000, 'load files content');
  };

  AdminPage.prototype.activateOption = function(checkbox) {
    var checkbox = checkbox;

    checkbox.getAttribute('checked').then(function(checked) {
      console.log(checked);
      if(checked == null) {
        checkbox.click();
      };
    });
  };

  AdminPage.prototype.disableOption = function(checkbox) {
    var checkbox = checkbox
    
    checkbox.getAttribute('checked').then(function(checked) {
      console.log(checked);
      if(checked == "true") {
        checkbox.click();
      };
    });
  };

  AdminPage.prototype.disableLinks = function() {
    this.allowLinksCheckBox.click();
  }

  module.exports = AdminPage;
})();