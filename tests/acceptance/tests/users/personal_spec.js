var Page = require('../helper/page.js');
var UserPage = require('../pages/user.page.js');
var LoginPage = require('../pages/login.page.js');
var FilesPage = require('../pages/files.page.js');
var PersonalPage = require('../pages/personal.page.js');
var protrac = protractor.getInstance();

describe('Personal', function() {
  var params = browser.params;
  var page;
  var userPage;
  var loginPage;
  var filesPage;
  var personalPage;

  beforeEach(function() {
    isAngularSite(false);
    page = new Page();
    filesPage = new FilesPage(params.baseUrl);
    userPage = new UserPage(params.baseUrl);
    loginPage = new LoginPage(params.baseUrl);
    personalPage = new PersonalPage(params.baseUrl);
  });

  it('setup',function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    userPage.get();
    userPage.createNewUser('demo01', 'pass');
    browser.sleep(500);
    expect(userPage.listUser()).toContain('demo01');
    loginPage.logout();
  });

  it('should have access to personal page', function() {
    filesPage.getAsUser('demo01', 'pass');
    page.displayName.click();
    browser.wait(function() {
      return page.userActionDropdown.isDisplayed();
    })
    page.settingPersonal.click();

    protrac.getCurrentUrl().then(function(url) {
      expect(personalPage.url).toEqual(url);
    });

  });

  it('should change a user password in the personal page', function() {
    filesPage.getAsUser('demo01', 'pass');
    personalPage.get();
    personalPage.changePassword('pass', 'password')

    loginPage.logout();
    loginPage.login('demo01', 'password');
    page.displayName.getText().then(function(displayName) {
      expect(displayName).toEqual('demo01');
    })
  });

  iit('should change display name', function() {
    filesPage.getAsUser('demo01', 'password');
    personalPage.get();
    personalPage.changeDisplayName('Sam Sample');
    personalPage.get();
    

    page.displayName.getText().then(function(displayName) {
      expect(displayName).toEqual('Sam Sample');
    })
  });

  it('clean up',function() {
    loginPage.logout();
    filesPage.getAsUser(params.login.user, params.login.password);
    userPage.get();
    userPage.deleteUser('demo01');
    userPage.get();
    expect(userPage.listUser()).not.toContain('demo01');
  });

});