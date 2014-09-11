/**
* ownCloud
*
* @author Sebastian Elpelt
* @copyright 2014 Sebastian Elpelt <sebastian@webhippie.de>
*
* This library is free software; you can redistribute it and/or
* modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
* License as published by the Free Software Foundation; either
* version 3 of the License, or any later version.
*
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU AFFERO GENERAL PUBLIC LICENSE for more details.
*
* You should have received a copy of the GNU Affero General Public
* License along with this library.  If not, see <http://www.gnu.org/licenses/>.
*
*/

var Page = require('../helper/page.js');
var FilesPage = require('../pages/files.page.js');
var UserPage = require('../pages/user.page.js');
var protrac = protractor.getInstance();

describe('Users', function() {
  var params = browser.params;
  var filesPage;
  var userPage;

  beforeEach(function() {
    isAngularSite(false);
    filesPage = new FilesPage(params.baseUrl);
    userPage = new UserPage(params.baseUrl);    
    userPage.getAsUser(params.login.user, params.login.password);
  });

  it('should access settings > users ', function() {
    // TODO: find a locatorfunction for Page.userActionDropdown.isDisplayed()
    // Page.displayName.click();
    // browser.wait(function() {
    //   return page.userActionDropdown.isDisplayed();
    // })
    // page.settingUsers.click();

    protrac.getCurrentUrl().then(function(url) {
      expect(userPage.url).toEqual(url);
    });
  });

  it('should login as admin and create a new user ', function() {
    userPage.getAsUser(params.login.user, params.login.password);
    userPage.createNewUser('demo', 'demo');
    userPage.get();
    expect(userPage.listUser()).toContain('demo');
    loginPage.logout();
  });
  
  it('should login with a new user', function() {    
    filesPage.getAsUser('demo', 'demo');
    expect(browser.getCurrentUrl()).toContain('index.php/apps/files/');
  });
  
  it('should login as admin and delete new user', function() {    
    userPage.getAsUser(params.login.user, params.login.password);
    userPage.deleteUser('demo');
    userPage.get();
    expect(userPage.listUser()).not.toContain('demo');
  });

  it('should create 15 users with password', function() {
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
      'demo11', 'demo12', 'demo13', 'demo14', 
      'demo15'
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
    userPage.renameDisplayName('demo01', 'Kevin Klever');
    userPage.renameDisplayName('demo02', 'Gundula Gaus');
    userPage.renameDisplayName('demo03', 'Petra Pan');

    userPage.get();
    element(Page.displayNameId()).getText().then(function(displayName) {
      expect(displayName).toEqual('Manfred Mustermann');
    })
  });

  it('should filter users', function() {
    userPage.get();
    userPage.userFilter.sendKeys('lev');
    browser.sleep(1000);
    expect(userPage.listUser()).toContain('Kevin Klever');  
  });

  it('should show warning, if create a user that allready exists', function() {
    userPage.get();
    userPage.createNewUser('demo01', 'password');
    browser.wait(function() {
      return userPage.warningDialog.isPresent();
    });
    expect(userPage.warningDialog.isDisplayed()).toBeTruthy();

  });

  it('should change password for users as admin', function() {
    userPage.changeUserPass('demo01', 'changedPass');
    loginPage.logout();
    loginPage.login('demo01', 'changedPass');


    protrac.getCurrentUrl().then(function(url) {
      expect(filesPage.url).toEqual(url);
    });
  });
});