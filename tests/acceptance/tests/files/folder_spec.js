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

var Page = require('../helper/page.js')
var LoginPage = require('../pages/login.page.js');
var FilesPage = require('../pages/files.page.js');


//================ FOLDERS =============================================================//
//======================================================================================//

describe('Folders', function() {
  var params = browser.params;
  var filesPage;
  
  beforeEach(function() {
    isAngularSite(false);
    filesPage = new FilesPage(params.baseUrl);
    filesPage.getAsUser(params.login.user, params.login.password);
  });

  it('should create a new folder', function() {
    filesPage.createFolder('testFolder');
    expect(filesPage.listFiles()).toContain('testFolder');
  });

  it('should not create new folder if foldername already exists', function() {
    filesPage.createFolder('testFolder');
    var warning = by.css('.tipsy-inner');
    expect(filesPage.alertWarning.isDisplayed()).toBeTruthy();
  });

  it('should have access to folder', function() {
    var protrac = protractor.getInstance();
    filesPage.goInToFolder('testFolder');

    var expectedUrl = filesPage.folderUrl('testFolder');
    protrac.getCurrentUrl().then(function(url) {
      expect(expectedUrl).toEqual(url);
      filesPage.get();
    });
  });

  it('should delete a folder', function() {
    browser.wait(function() {
      return(filesPage.listFiles());
    }, 3000);
    filesPage.deleteFolder('testFolder');
    browser.sleep(800);
    expect(filesPage.listFiles()).not.toContain('testFolder');
  });
});

//================ SUB FOLDERS =======================================================================//
//====================================================================================================//

describe('Subfolders', function() {
  var params = browser.params;
  var filesPage;
  
  beforeEach(function() {
    isAngularSite(false);
    filesPage = new FilesPage(params.baseUrl);
    filesPage.getAsUser(params.login.user, params.login.password);
  });


  it('should go into folder and create subfolder', function() {
    filesPage.createFolder('hasSubFolder');
    filesPage.getFolder('hasSubFolder');
    filesPage.createFolder('SubFolder');
    filesPage.createFolder('SubFolder2');
    expect(filesPage.listFiles()).toContain('SubFolder', 'SubFolder2');
  });  

  it('should rename a subfolder', function() {
    filesPage.getFolder('hasSubFolder');
    filesPage.renameFolder('SubFolder2', 'NewSubFolder');
    browser.wait(function() {
      return(filesPage.listFiles());
    }, 3000);
    expect(filesPage.listFiles()).toContain('NewSubFolder');
  });

  it('should delete a subfolder', function() {
    filesPage.getFolder('hasSubFolder');
    filesPage.deleteFolder('SubFolder').then(function() {
      expect(filesPage.listFiles()).not.toContain('SubFolder');
    });
  });

  it('should delete a folder containing a subfolder', function() {
    filesPage.deleteFolder('hasSubFolder').then(function() {
      expect(filesPage.listFiles()).not.toContain('hasSubFolder');
    });
  });
});