var FilesPage = require('../pages/files.page.js');
var UserPage = require('../pages/user.page.js');

describe('Users', function() {
  var params = browser.params;
  var filesPage;
  var userPage;

  beforeEach(function() {
    isAngularSite(false);
    filesPage = new FilesPage(params.baseUrl);
    userPage = new UserPage(params.baseUrl);
    filesPage.getAsUser(params.login.user, params.login.password);
  });

  it('should access settings > users ', function() {
    var protrac = protractor.getInstance();
    filesPage.displayName.click();
    browser.wait(function() {
      return filesPage.userActionDropdown.isDisplayed();
    })
    filesPage.settingUsers.click();

    protrac.getCurrentUrl().then(function(url) {
      expect(userPage.url).toEqual(url);
    });
  });

  it('should create 10 users with password', function() {
    userPage.createNewUser('demo01', 'password');
    userPage.createNewUser('demo02', 'password');
    userPage.createNewUser('demo03', 'password');
    userPage.createNewUser('demo04', 'password');
    userPage.createNewUser('demo05', 'password');
    userPage.createNewUser('demo06', 'password');
    userPage.createNewUser('demo07', 'password');
    userPage.createNewUser('demo08', 'password');
    userPage.createNewUser('demo09', 'password');
    userPage.createNewUser('demo10', 'password');
    userPage.createNewUser('demo11', 'password');
    userPage.createNewUser('demo12', 'password');
    userPage.createNewUser('demo13', 'password');
    userPage.createNewUser('demo14', 'password');
    userPage.createNewUser('demo15', 'password');

    expect(userPage.listUser()).toContain(
      'demo01', 'demo02', 'demo03', 'demo04', 'demo05', 
      'demo06', 'demo07', 'demo08', 'demo09', 'demo10',
      'demo11', 'demo12', 'demo13', 'demo14', 'demo15'
    );
    userPage.get();
    userPage.deleteUser('demo04');
    userPage.deleteUser('demo05');
    userPage.deleteUser('demo06');
    userPage.deleteUser('demo07');
    userPage.deleteUser('demo08');
    userPage.deleteUser('demo09');
    userPage.deleteUser('demo10');
    userPage.deleteUser('demo11');
    userPage.deleteUser('demo12');
    userPage.deleteUser('demo13');
    userPage.deleteUser('demo14');
    userPage.deleteUser('demo15');
  }); 

  it('should change displayname', function() {
    userPage.renameDisplayName('admin', 'Manfred Mustermann');
    userPage.renameDisplayName('demo01', 'Kevin Klever');
    userPage.renameDisplayName('demo02', 'Gundula Gaus');
    userPage.renameDisplayName('demo03', 'Petra Pan');

    userPage.get();
    filesPage.displayName.getText().then(function(displayName) {
      expect(displayName).toEqual('Manfred Mustermann');
    })
  });

  it('should filter users', function() {
    userPage.get();
    userPage.userFilter.sendKeys('lev');
    browser.sleep(1000);
    expect(userPage.listUser()).toContain('Kevin Klever');  
  });
});