var LoginPage = require('../pages/login.page.js');
var FilesPage = require('../pages/files.page.js');
var UserPage = require('../pages/user.page.js');
var ShareApi = require('../pages/share_api.page.js');
var flow = protractor.promise.controlFlow();

// ============================ FILTER =============================================================== //
// =================================================================================================== //

describe('Filter', function() {
  var params = browser.params;
  var logninPage;
  var filesPage;
  var userPage;
  var shareApi;
  
  beforeEach(function() {
    isAngularSite(false);
    loginPage = new LoginPage(params.baseUrl);
    filesPage = new FilesPage(params.baseUrl);
    userPage = new UserPage(params.baseUrl);
    shareApi = new ShareApi(params.baseUrl);
  });

  it('should setup', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    userPage.get();
    userPage.createNewUser('demo', 'password');

    filesPage.get();

    var createFiles = function() {
      filesPage.createNewFolder('sharedFoler');
      filesPage.createNewTxtFile('sharedFile');
      filesPage.createNewTxtFile('sharedFile2');
    };

    var createShares = function() {
      shareApi.create('sharedFoler', 'demo', 0);
      shareApi.create('sharedFile.txt', 'demo', 0);
      shareApi.create('sharedFile2.txt', 'demo', 0);
    };
    
    flow.execute(createFiles);
    flow.execute(createShares);

    expect(filesPage.listFiles()).toContain('sharedFoler', 'sharedFile', 'sharedFile2');
    loginPage.logout(); 
  });

  it('should show files shared with others', function() {
    filesPage.getAsUser('demo', 'password');
    filesPage.filterSharedWhithYou.click();
    browser.wait(function() {
      return filesPage.listFiles();
    });
    expect(filesPage.listFiles()).toContain('sharedFoler', 'sharedFile', 'sharedFile2');
    loginPage.logout();
  });

  it('should show files shared with others', function() {
    filesPage.getAsUser(params.login.user, params.login.password);

    filesPage.filterSharedWhithOthers.click();

    expect(filesPage.listFiles()).toContain('sharedFoler', 'sharedFile', 'sharedFile2');
  });

  it('should show all files', function() {
    filesPage.getAsUser(params.login.user, params.login.password);

    filesPage.filterAllFiles.click();

    expect(filesPage.listFiles()).toContain('music', 'documents', 'photos', 'sharedFoler', 'sharedFile', 'sharedFile2');
  });

});