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
var UserPage = require('../pages/user.page.js');
var LoginPage = require('../pages/login.page.js');
var FilesPage = require('../pages/files.page.js');
var PersonalPage = require('../pages/personal.page.js');
var protrac = protractor.getInstance();

describe('Personal', function() {
  var params = browser.params;
  var userPage;
  var loginPage;
  var filesPage;
  var personalPage;

  beforeEach(function() {
    isAngularSite(false);
    filesPage = new FilesPage(params.baseUrl);
    userPage = new UserPage(params.baseUrl);
    loginPage = new LoginPage(params.baseUrl);
    personalPage = new PersonalPage(params.baseUrl);
  });

  it('setup',function() {
    userPage.getAsUser(params.login.user, params.login.password);
    userPage.createNewUser('demo1', 'pass').then(function() {
      browser.sleep(500);
      expect(userPage.listUser()).toContain('demo1');
      loginPage.logout();  
    });
  });

  it('should have access to personal page', function() {
    personalPage.getAsUser('demo1', 'pass');
    // TODO: find a Locatorfunction for Page.userActionDropdownId() 
    // element(Page.displayNameId()).click();
    // browser.wait(function() {
    //   console.log()
    //   return element(Page.userActionDropdownId()).isDisplayed();
    // }, 3000, 'open dropdown');
    // element(Page.settingPersonalId()).click();

    protrac.getCurrentUrl().then(function(url) {
      expect(personalPage.url).toEqual(url);
    });

  });

  it('should change a user password in the personal page', function() {
    personalPage.getAsUser('demo1', 'pass');
    personalPage.changePassword('pass', 'password')

    loginPage.logout();
    loginPage.login('demo1', 'password');
    element(Page.displayNameId()).getText().then(function(displayName) {
      expect(displayName).toEqual('demo1');
    })
  });

  it('should change display name', function() {
    personalPage.getAsUser('demo1', 'password');
    personalPage.changeDisplayName('Sam Sample');
    personalPage.get();

    element(Page.displayNameId()).getText().then(function(displayName) {
      expect(displayName).toEqual('Sam Sample');
    })
  });

  it('clean up',function() {
    loginPage.logout();
    userPage.getAsUser(params.login.user, params.login.password);
    userPage.deleteUser('demo1');
    expect(userPage.listUser()).not.toContain('demo1');
  });

});