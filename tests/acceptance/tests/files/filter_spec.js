/**
* ownCloud
*
* @author Sebastian Elpelt
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
var LoginPage = require('../pages/login.page.js');
var FilesPage = require('../pages/files.page.js');
var UserPage = require('../pages/user.page.js');
var ShareApi = require('../pages/share_api.page.js');
var flow = protractor.promise.controlFlow();

//================ FILTERS =============================================================//
//======================================================================================//

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

  it('setup', function() {
    userPage.getAsUser(params.login.user, params.login.password, userPage.url);
    userPage.createNewUser('demo', 'password');

    filesPage.get();

    var create = function() {
      filesPage.createFolder('sharedFoler');
      filesPage.createTxtFile('sharedFile');
      filesPage.createTxtFile('sharedFile2');
    };

    var share = function() {
      shareApi.create('sharedFoler', 'demo', 0);
      shareApi.create('sharedFile.txt', 'demo', 0);
      shareApi.create('sharedFile2.txt', 'demo', 0);
    };
    
    flow.execute(create);
    flow.execute(share);

    expect(filesPage.listFiles()).toContain('sharedFoler', 'sharedFile', 'sharedFile2');
    loginPage.logout(); 
  });

  it('should show files shared with you', function() {
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

  it('clean up', function() {
    filesPage.getAsUser(params.login.user, params.login.password).then(function() {
      filesPage.deleteFile('sharedFile.txt');
      filesPage.deleteFile('sharedFile2.txt');
      filesPage.deleteFolder('sharedFoler');
    });
  });
});