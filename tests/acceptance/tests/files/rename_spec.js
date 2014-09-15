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

describe('Rename Folder', function() {
  var params = browser.params;
  var filesPage;
  
  beforeEach(function() {
    isAngularSite(false);
    filesPage = new FilesPage(params.baseUrl);
    filesPage.getAsUser(params.login.user, params.login.password);
  });

  it('should rename a folder', function() {
    filesPage.createFolder('testFolder');
    filesPage.renameFolder('testFolder', 'newFolder').then(function() {
      expect(filesPage.listFiles()).toContain('newFolder');
    });
  });

  it('should show alert message if foldername already in use', function() {
    filesPage.createFolder('testFolder');
    filesPage.renameFolder('testFolder', 'newFolder').then(function() {
      expect(filesPage.alertWarning.isDisplayed()).toBeTruthy();
    });
  });

  it('should show alert message if using forbidden characters', function() {
    filesPage.renameFolder('newFolder', 'new:Folder').then(function() {
      expect(filesPage.alertWarning.isDisplayed()).toBeTruthy();
    });
  });

  it('should rename a file using special characters', function() {
    filesPage.renameFolder('testFolder', 'sP€c!@L B-)').then(function() {
      expect(filesPage.listFiles()).toContain('sP€c!@L B-)');
    });
  });

  it('should show alert message if newName is empty', function() {
    filesPage.renameFolder('newFolder', "").then(function() {
      expect(filesPage.alertWarning.isDisplayed()).toBeTruthy();
    });
  });

  it('clean up', function() {
    filesPage.deleteFolder('newFolder');
    filesPage.deleteFolder('sP€c!@L B-)');  
  });
}); 

//================ FILES ===============================================================//
//======================================================================================//

describe('Rename Files', function() {
  var params = browser.params;
  var filesPage;
  
  beforeEach(function() {
    isAngularSite(false);
    filesPage = new FilesPage(params.baseUrl);
    filesPage.getAsUser(params.login.user, params.login.password);
  });

  it('should rename a txt file', function() {
    filesPage.createTxtFile('testText');
    filesPage.renameFile('testText.txt', 'newText.txt').then(function() {
      expect(filesPage.listFiles()).toContain('newText');
    });
  });

  it('should show alert message if filename is already in use', function() {
    filesPage.createTxtFile('testText');
    filesPage.renameFile('testText.txt', 'newText.txt').then(function() {
      expect(filesPage.alertWarning.isDisplayed()).toBeTruthy();
    });
  });

  // it('should rename a file with the same name but changed capitalization', function() {
  //   browser.takeScreenshot().then(function (png) {
      
  //     new Screenshot(png, 'SameNameCapitalization1.png');
  //   filesPage.renameFile('testText.txt', 'NewText.txt');
  //   browser.wait(function() {
  //     return(filesPage.listFiles());
  //   }, 3000);
  //   });
  //   browser.takeScreenshot().then(function (png) {
  //       new Screenshot(png, 'SameNameCapitalization2.png');
  //   });
  //   expect(filesPage.listFiles()).toContain('NewText.txt');
  // });

  it('should rename a file using special characters', function() {
    filesPage.renameFile('newText.txt', 'sP€c!@L B-).txt').then(function() {
      expect(filesPage.listFiles()).toContain('sP€c!@L B-)');
    })
  });

  it('should show alert message if newName is empty', function() {
    filesPage.renameFile('sP€c!@L B-).txt', '').then(function() {
      expect(filesPage.alertWarning.isDisplayed()).toBeTruthy();
    });
  });

  it('should rename a file by taking off the file extension', function() {
    filesPage.renameFile('testText.txt', 'Without Subfix').then(function() {
      expect(filesPage.listFiles()).toContain('Without Subfix');
    });
  });
  
  it('clean up', function() {
    filesPage.deleteFile('Without Subfix');
    filesPage.deleteFile('sP€c!@L B-).txt');
  });
});