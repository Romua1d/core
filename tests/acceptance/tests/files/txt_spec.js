var LoginPage = require('../pages/login.page.js');
var FilesPage = require('../pages/files.page.js');
var UserPage = require('../pages/user.page.js');
var Screenshot = require('../helper/screenshot.js');

// ============================ TXT FILES ============================================================ //
// =================================================================================================== //

describe('Txt Files', function() {
  var params = browser.params;
  var filesPage;
  var loginPage;
  
  beforeEach(function() {
    isAngularSite(false);
    filesPage = new FilesPage(params.baseUrl);
    loginPage = new LoginPage(params.baseUrl);
    filesPage.getAsUser(params.login.user, params.login.password);
  });

  it('should create a new txt file', function() {
    filesPage.createNewTxtFile('testText');
    expect(filesPage.listFiles()).toContain('testText');
  });

  it('should not create new file if filename already exists', function() {
    filesPage.createNewTxtFile('testText');
    expect(filesPage.alertWarning.isDisplayed()).toBeTruthy();
  });

  it('should delete a txt file', function() {
    browser.wait(function() {
      return(filesPage.listFiles());
    }, 3000);
    filesPage.deleteFile('testText.txt');
    expect(filesPage.listFiles()).not.toContain('testText')
  });

  it('should delete a shared file only form user', function() {
    var userPage = new UserPage(params.baseUrl);

    filesPage.getAsUser(params.login.user, params.login.password);
    userPage.get();
    userPage.createNewUser('demo', 'password');

    filesPage.get();
    filesPage.createNewTxtFile('toDeleteByUser');
    filesPage.shareFile('toDeleteByUser.txt', 'demo');

    loginPage.logout();
    loginPage.login('demo', 'password');
    filesPage.deleteFile('toDeleteByUser.txt');
    browser.sleep(800);
    expect(filesPage.listFiles()).not.toContain('inSharedBySecond');

    loginPage.logout();
    loginPage.login(params.login.user, params.login.password);
    expect(filesPage.listFiles()).toContain('toDeleteByUser');
    filesPage.deleteFile('toDeleteByUser.txt');
  });

  it('should edit a txt file', function() {
    filesPage.createNewTxtFile('new');
    filesPage.editTxtFile('new.txt', 'It works');
    expect(filesPage.getTextContent()).toEqual('It works');
    filesPage.deleteFile('new.txt');
  });

});