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

var Page = require('../helper/page.js')
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
  });

  it('should create a new txt file', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.createTxtFile('testText');
    expect(filesPage.listFiles()).toContain('testText');
  });

  it('should not create new file if filename already exists', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.createTxtFile('testText');
    expect(filesPage.alertWarning.isDisplayed()).toBeTruthy();
  });

  it('should delete a txt file', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.deleteFile('testText.txt');
    expect(filesPage.listFiles()).not.toContain('testText')
  });

  it('should delete a shared file only form user', function() {
    var userPage = new UserPage(params.baseUrl);
    userPage.getAsUser(params.login.user, params.login.password);
    userPage.createNewUser('demo', 'password');

    filesPage.get();
    filesPage.createTxtFile('toDeleteByUser');
    filesPage.shareFile('toDeleteByUser.txt', 'demo');

    loginPage.logout();
    filesPage.getAsUser('demo', 'password');
    filesPage.deleteFile('toDeleteByUser.txt');
    browser.sleep(800);
    expect(filesPage.listFiles()).not.toContain('toDeleteByUser');

    loginPage.logout();
    filesPage.getAsUser(params.login.user, params.login.password).then(function() {
      expect(filesPage.listFiles()).toContain('toDeleteByUser');
      filesPage.deleteFile('toDeleteByUser.txt');
    });
  });

  it('should edit a txt file', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.createTxtFile('new');
    filesPage.editTxtFile('new.txt', 'It works');
    expect(filesPage.getTextContent()).toEqual('It works');
    filesPage.get();
    filesPage.deleteFile('new.txt');
  });

});