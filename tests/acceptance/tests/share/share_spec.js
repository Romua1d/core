/*
 * Copyright (c) 2014
 *
 * This file is licensed under the Affero General Public License version 3
 * or later.
 *
 * See the COPYING-README file.
 *
 */

var UserPage = require('../pages/user.page.js');
var FilesPage = require('../pages/files.page.js');
var AdminPage = require('../pages/admin.page.js');
var Page = require('../helper/page.js');

var ShareApi = require('../pages/share_api.page.js');
var parseXml = require('xml2js').parseString;
var flow = protractor.promise.controlFlow();
var protrac = protractor.getInstance();

//================ CREATE SHARES =======================================================//
//======================================================================================//

describe('Create shares', function() {
  var params = browser.params;
  var userPage;
  var filesPage;
  var adminPage;
  var shareApi;

  beforeEach(function() {
    isAngularSite(false);
    userPage = new UserPage(params.baseUrl);
    filesPage = new FilesPage(params.baseUrl);
    adminPage = new AdminPage(params.baseUrl);
    shareApi = new ShareApi(params.baseUrl);
  });

  it('setup', function() {
    userPage.getAsUser(params.login.user, params.login.password);
    // userPage.get();
    // userPage.createNewGroup('test_specGroup_1');
    // userPage.createNewGroup('test_specGroup_2');
    userPage.createNewUser('demo', 'password');
    userPage.createNewUser('demo2', 'password');
    userPage.createNewUser('demo3', 'password');
    userPage.createNewUser('demo4', 'password');
    userPage.get();
    userPage.renameDisplayName('demo2', ' display2');
    userPage.renameDisplayName('demo3', ' display3');
    userPage.renameDisplayName('demo4', ' display4');
      // setting Group to User fails cause click receives an other element
    // userPage.setUserGroup('demo2', 'test_specGroup_1');
    // userPage.setUserGroup('demo3', 'test_specGroup_1');
    // userPage.setUserGroup('demo4', 'test_specGroup_2');
    expect(userPage.listUser()).toContain('demo', 'demo2', 'demo3', 'demo4');
  });


  it('should share a folder with another user by username', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.createFolder('toShare_1');
    browser.sleep(500);
    filesPage.shareFile('toShare_1', 'demo');

    filesPage.getAsUser('demo', 'password');
    expect(filesPage.listFiles()).toContain('toShare_1');
  });

  it('should share a folder including special characters', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.createFolder('sP€c!@L');
    browser.sleep(500);
    filesPage.shareFile('sP€c!@L', 'demo');

    filesPage.getAsUser('demo', 'password');
    expect(filesPage.listFiles()).toContain('sP€c!@L');
  });

  it('should share a folder with 3 another user by display name', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.createFolder('toShare_2');
    browser.sleep(500);
    filesPage.shareFile('toShare_2', 'display2');

    filesPage.shareWithForm.sendKeys(protractor.Key.DELETE);
    filesPage.shareWithForm.sendKeys('display3');
    browser.wait(function(){
      return filesPage.sharedWithDropdown.isDisplayed();
    }, 3000);
    filesPage.shareWithForm.sendKeys(protractor.Key.ENTER);

    filesPage.shareWithForm.sendKeys(protractor.Key.DELETE);
    filesPage.shareWithForm.sendKeys('display4');
    browser.wait(function(){
      return filesPage.sharedWithDropdown.isDisplayed();
    }, 3000);
    filesPage.shareWithForm.sendKeys(protractor.Key.ENTER);

    filesPage.getAsUser('demo4', 'password');
    expect(filesPage.listFiles()).toContain('toShare_2');

    filesPage.getAsUser('demo3', 'password');
    expect(filesPage.listFiles()).toContain('toShare_2');

    filesPage.getAsUser('demo2', 'password');
    expect(filesPage.listFiles()).toContain('toShare_2');
  });

  it('clean up', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.deleteFolder('sP€c!@L');
    filesPage.deleteFolder('toShare_1');
    filesPage.deleteFolder('toShare_2');

    userPage.get();
    userPage.deleteUser('demo');
    userPage.deleteUser('demo2');
    userPage.deleteUser('demo3');
    userPage.deleteUser('demo4');
    userPage.get(); // delete last user 
    expect(userPage.listUser()).not.toContain('demo', 'demo2', 'demo3', 'demo4');
  });
});


//================ CRUD RIGHTS IN SHARED FOLDERS =======================================//
//======================================================================================//

ddescribe('CRUD rights in shared folders', function() {
  var params = browser.params;
  var userPage;
  var filesPage;
  var adminPage;
  var shareApi;

  beforeEach(function() {
    isAngularSite(false);
    userPage = new UserPage(params.baseUrl);
    filesPage = new FilesPage(params.baseUrl);
    adminPage = new AdminPage(params.baseUrl);
    shareApi = new ShareApi(params.baseUrl);
  });

  it('setup', function() {
    userPage.getAsUser(params.login.user, params.login.password);
    userPage.createNewUser('demo', 'password');
    userPage.createNewUser('demo2', 'password');
    userPage.get();
    expect(userPage.listUser()).toContain('demo', 'demo2');

    filesPage.get();
    var createFile = function() {
      filesPage.createFolder('sharedFolder')
    };
    var createShare = function() {
      return shareApi.create('sharedFolder', 'demo', 0);
    };

    flow.execute(createFile);
    flow.execute(createShare);

    filesPage.getAsUser('demo', 'password');
    expect(filesPage.listFiles()).toContain('sharedFolder');
  });

  it('should have access to shared folder', function() {
    filesPage.getAsUser('demo', 'password');
    filesPage.getFolder('sharedFolder');
    protrac.getCurrentUrl().then(function(url) {
      expect(filesPage.folderUrl('sharedFolder')).toEqual(url);
    });
  });

  it('should create file in shared folder', function() {
    filesPage.getAsUser('demo', 'password');
    filesPage.getFolder('sharedFolder');
    filesPage.createTxtFile('inSharedBySecond');
    filesPage.createTxtFile('toBeDeleted');
    expect(filesPage.listFiles()).toContain('inSharedBySecond' ,'toBeDeleted');
  });

  it('should delete file in shared folder', function() {
    filesPage.getAsUser('demo', 'password');
    filesPage.getFolder('sharedFolder');
    filesPage.deleteFile('toBeDeleted.txt');
    browser.sleep(800);
    expect(filesPage.listFiles()).not.toContain('toBeDeleted');
  });

  it('should share file in shared folder', function() {
    filesPage.getAsUser('demo', 'password');
    filesPage.getFolder('sharedFolder');
    filesPage.shareFile('inSharedBySecond.txt', 'demo2');
    filesPage.getAsUser('demo2', 'password');
    expect(filesPage.listFiles()).toContain('inSharedBySecond');
  });

  it('should rename file in shared folder', function() {
    filesPage.getAsUser('demo', 'password');
    filesPage.getFolder('sharedFolder');
    filesPage.renameFile('inSharedBySecond.txt', 'renamedBySecond.txt')
    expect(filesPage.listFiles()).toContain('renamedBySecond');
  });

  it('should edit file in shared folder', function() {
    filesPage.getAsUser('demo', 'password');
    filesPage.getFolder('sharedFolder');
    filesPage.editTxtFile('renamedBySecond.txt', 'I am an edit of a shared file')
    expect(filesPage.getTextContent()).toEqual('I am an edit of a shared file');
  });

  it('clean up', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.deleteFolder('sharedFolder');
    userPage.get();
    userPage.deleteUser('demo');
    userPage.deleteUser('demo2');
    userPage.get(); // delete last user 
    expect(userPage.listUser()).not.toContain('demo', 'demo2');
  });
});

//================ DELETE SHARED FILES AND FOLDERS =====================================//
//======================================================================================//

describe('Delete shared files and folders', function() {
  var params = browser.params;
  var userPage;
  var filesPage;
  var adminPage;
  var shareApi;

  beforeEach(function() {
    isAngularSite(false);
    userPage = new UserPage(params.baseUrl);
    filesPage = new FilesPage(params.baseUrl);
    adminPage = new AdminPage(params.baseUrl);
    shareApi = new ShareApi(params.baseUrl);
  });

  it('setup', function() {
    userPage.getAsUser(params.login.user, params.login.password);
    userPage.createNewUser('demo', 'password');
    browser.sleep(500);
    expect(userPage.listUser()).toContain('demo');
  });

  it('should delete the root folder shared with a user account by another user', function() {
    filesPage.getAsUser(params.login.user, params.login.password);

    var createFile = function() {
      filesPage.createTxtFile('toShare')
    };
    var createShare = function() {
      return shareApi.create('toShare.txt', 'demo', 0);
    };

    flow.execute(createFile);
    flow.execute(createShare);

    filesPage.getAsUser('demo', 'password');
    filesPage.deleteFile('toShare.txt');
    browser.sleep(800);
    expect(filesPage.listFiles()).not.toContain('toShare');

    filesPage.getAsUser(params.login.user, params.login.password);
    expect(filesPage.listFiles()).toContain('toShare');
    filesPage.deleteFile('toShare.txt');
  });

  it('should delete a file shared with a user, only form user if user deletes it', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.createTxtFile('toDeleteByUser');
    filesPage.shareFile('toDeleteByUser.txt', 'demo');

    filesPage.getAsUser('demo', 'password');
    filesPage.deleteFile('toDeleteByUser.txt');
    browser.sleep(800);
    expect(filesPage.listFiles()).not.toContain('inSharedBySecond');

    filesPage.getAsUser(params.login.user, params.login.password);
    expect(filesPage.listFiles()).toContain('toDeleteByUser');
    filesPage.deleteFile('toDeleteByUser.txt');
  });

  it('should delete a file in a shared folder, from all', function() {
    filesPage.getAsUser(params.login.user, params.login.password);

    var createFile = function() {
      filesPage.createFolder('sharedFolder')    
      filesPage.getFolder('sharedFolder');
      filesPage.createTxtFile('toDeleteFromAll');
    };
    var createShare = function() {
      return shareApi.create('sharedFolder', 'demo', 0);
    };

    flow.execute(createFile);
    flow.execute(createShare);

    filesPage.getAsUser('demo', 'password');
    filesPage.getFolder('sharedFolder');
    filesPage.deleteFile('toDeleteFromAll.txt');
    browser.sleep(800);
    expect(filesPage.listFiles()).not.toContain('toDeleteFormAll');

    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.getFolder('sharedFolder');
    expect(filesPage.listFiles()).not.toContain('toDeleteFromAll');
    filesPage.get();
    filesPage.deleteFolder('sharedFolder');
  });

  it('should delete a file shared with a user, form all if owner deletes it', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.createTxtFile('toDeleteByOwner');
    filesPage.shareFile('toDeleteByOwner.txt', 'demo');

    filesPage.getAsUser('demo', 'password');
    expect(filesPage.listFiles()).toContain('toDeleteByOwner');

    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.deleteFile('toDeleteByOwner.txt');
  
    filesPage.getAsUser('demo', 'password');
    expect(filesPage.listFiles()).not.toContain('toDeleteByOwner');
  });

  it('clean up', function() {
    userPage.getAsUser(params.login.user, params.login.password);
    userPage.deleteUser('demo');
    userPage.get(); // delete last user 
    expect(userPage.listUser()).not.toContain('demo');
  });
});

//================ SHARE OPTIONS =======================================================//
//======================================================================================//

describe('Share options', function() {
  var params = browser.params;
  var userPage;
  var filesPage;
  var adminPage;
  var shareApi;

  beforeEach(function() {
    isAngularSite(false);
    userPage = new UserPage(params.baseUrl);
    filesPage = new FilesPage(params.baseUrl);
    adminPage = new AdminPage(params.baseUrl);
    shareApi = new ShareApi(params.baseUrl);
  });

  it('setup', function() {
    userPage.getAsUser(params.login.user, params.login.password);
    userPage.createNewUser('demo', 'password');
    browser.sleep(500);
    expect(userPage.listUser()).toContain('demo');
  });

  it('should not be possible to reshare a folder, if the "re-share" option is removed', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.createFolder('noReshare');
    filesPage.shareFile('noReshare', 'demo');
    filesPage.disableReshare('noReshare', 'demo');
  
    filesPage.getAsUser('demo', 'password');

    expect(filesPage.checkReshareability('noReshare')).toBeFalsy();
  });

  it('should not be possible to modify a file shared without edit privileges', function() {
    filesPage.getAsUser(params.login.user, params.login.password);

    var createFile = function() {
      filesPage.createTxtFile('noEdits')
    };
    var createShare = function() {
      return shareApi.create('noEdits.txt', 'demo', 0);
    };

    flow.execute(createFile);
    flow.execute(createShare);
    filesPage.disableEdit('noEdits.txt', 'demo');
    filesPage.editTxtFile('noEdits.txt', 'No Edits by User!');

    filesPage.getAsUser('demo', 'password');
    filesPage.openFile('noEdits.txt');
    expect(element(filesPage.saveButtonId).toBeDisplayed).toBeFalsy();
  });

  it('should change file, when user (not the owner) with privileges edits it', function() {
    loginPage.logout
    filesPage.getAsUser(params.login.user, params.login.password);

    var createFile = function() {
      filesPage.createTxtFile('userEdits')
    };
    var createShare = function() {
      return shareApi.create('userEdits.txt', 'demo', 0);
    };

    flow.execute(createFile);
    flow.execute(createShare);

    filesPage.getAsUser('demo', 'password');
    filesPage.editTxtFile('userEdits.txt', 'User made edits!');
    
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.openFile('userEdits.txt');    
    expect(filesPage.getTextContent()).toEqual('User made edits!')
    filesPage.get();
    filesPage.deleteFile('userEdits.txt');
  });

  it('should change file for all users, when owner edits shared file', function() {
    filesPage.getAsUser(params.login.user, params.login.password);

    var createFile = function() {
      filesPage.createTxtFile('ownerEdits')
    };
    var createShare = function() {
      return shareApi.create('ownerEdits.txt', 'demo', 0);
    };

    flow.execute(createFile);
    flow.execute(createShare);
    filesPage.editTxtFile('ownerEdits.txt', 'Owner made edits!');

    filesPage.getAsUser('demo', 'password');
    filesPage.openFile('ownerEdits.txt');    
    expect(filesPage.getTextContent()).toEqual('Owner made edits!')
  });

  it('should not be possible to share via link, if admin disabled this option', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    adminPage.get();
    adminPage.disableLinks();
    filesPage.get();
    filesPage.openShareForm('ownerEdits.txt');
    expect(filesPage.shareLinkCheckBox.toBeDisplayed()).toBeFalsy();

    adminPage.get();
    adminPage.disableLinks();
  });

  it('should show the shared icon on all files and Folders within a shared directory', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    var createFiles = function() {
      filesPage.createFolder('sharedFolder');
      filesPage.getFolder('sharedFolder');
      filesPage.createTxtFile('sharedFile');
      filesPage.createTxtFile('otherSharedFile');
      filesPage.createFolder('folderInSharedFolder');
      filesPage.createFolder('otherFolderInSharedFolder');
    };

    var createShare = function() {
      shareApi.create('sharedFolder', 'demo', 0);
    };
   
    flow.execute(createFiles);
    flow.execute(createShare);

    filesPage.getAsUser('demo', 'password');
    filesPage.getFolder('sharedFolder').then(function() {
      var sharedFile = element(filesPage.permanentShareButtonId('sharedFile.txt'));
      browser.sleep(800);
      var otherSharedFile = element(filesPage.permanentShareButtonId('otherSharedFile.txt'));
      var folderInSharedFolder = element(filesPage.permanentShareButtonId('folderInSharedFolder'));
      var otherFolderInSharedFolder = element(filesPage.permanentShareButtonId('otherFolderInSharedFolder'));
      expect(sharedFile.isDisplayed()).toBeTruthy();
      expect(otherSharedFile.isDisplayed()).toBeTruthy();
      expect(folderInSharedFolder.isDisplayed()).toBeTruthy();
      expect(otherFolderInSharedFolder.isDisplayed()).toBeTruthy();
    })
  });

  it('should rename a shared folder and the folder stays shared', function() {
    filesPage.getAsUser(params.login.user, params.login.password); 
    var createFolder = function() {
    filesPage.createFolder('sharedFolder3');
    };

    var createShare = function() {
      shareApi.create('sharedFolder3', 'demo', 0);
    };

    flow.execute(createFolder);
    flow.execute(createShare);

    filesPage.getAsUser('demo', 'password');
    filesPage.renameFile('sharedFolder3', 'renamedSharedFolder');
    browser.sleep(500);
    expect(element(filesPage.permanentShareButtonId('renamedSharedFolder')).isDisplayed()).toBeTruthy();
  });

  it('should share a file, if it is moved in a shared folder', function() {
    filesPage.getAsUser(params.login.user, params.login.password); 
    var createFolder = function() {
    filesPage.createFolder('moveItIn');
    filesPage.createTxtFile('moveMeIn');
    };

    var createShare = function() {
      shareApi.create('moveItIn', 'demo', 0);
    };

    flow.execute(createFolder);
    flow.execute(createShare);

    Page.dragAndDrop(filesPage.fileListElemId('moveMeIn.txt'), filesPage.fileListElemId('moveItIn'));
    filesPage.getAsUser('demo', 'password');
    filesPage.getFolder('moveItIn');
    expect(filesPage.listFiles()).toContain('moveMeIn');
  });

  it('should have access to a shared subfolder', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    var protrac = protractor.getInstance();
    var createFolder = function() {
      filesPage.createFolder('sharedFolder4');
      filesPage.getFolder('sharedFolder4');
      filesPage.createFolder('subFolder');
    };
    var createShare = function() {
      shareApi.create('sharedFolder4', 'demo', 0);
    };

    flow.execute(createFolder);
    flow.execute(createShare);
    filesPage.getAsUser('demo', 'password');
    filesPage.getSubFolder('sharedFolder4', 'subFolder');

    var expectedUrl = filesPage.folderUrl('sharedFolder4' + '%2F' + 'subFolder');

    protrac.getCurrentUrl().then(function(url) {
      expect(expectedUrl).toEqual(url);
    });
  });

  it('clean up', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.deleteFolder('noReshare');
    filesPage.deleteFolder('sharedFolder');
    filesPage.deleteFolder('sharedFolder3');
    filesPage.deleteFolder('sharedFolder4');
    filesPage.deleteFolder('moveItIn');
    filesPage.deleteFile('noEdits.txt');
    filesPage.deleteFile('ownerEdits.txt');
  
    userPage.get();
    userPage.deleteUser('demo');
    userPage.get(); // delete last user 
    expect(userPage.listUser()).not.toContain('demo');
  });
});

//================ ADMIN CONFIGS SHARE =================================================//
//======================================================================================//

describe('Admin configs Share', function() {
  var params = browser.params;
  var userPage
  var filesPage;
  var adminPage;
  var shareApi;

  beforeEach(function() {
    isAngularSite(false);
    userPage = new UserPage(params.baseUrl);
    filesPage = new FilesPage(params.baseUrl);
    adminPage = new AdminPage(params.baseUrl);
    shareApi = new ShareApi(params.baseUrl);
  });

  it('setup', function() {
    userPage.getAsUser(params.login.user, params.login.password);
    userPage.createNewUser('demo', 'password');
    browser.sleep(500);
    expect(userPage.listUser()).toContain('demo');
  });

  it('should not be possible to share via link, if admin disabled this option', function() {
    adminPage.getAsUser(params.login.user, params.login.password);
    adminPage.disableOption(adminPage.allowLinksCheckBox);
    filesPage.get();
    filesPage.createTxtFile('noLinks');
    filesPage.openShareForm('noLinks.txt');
    expect(filesPage.shareLinkCheckBox.isPresent()).toBeFalsy();
    filesPage.deleteFile('noLinks.txt');
    adminPage.get();
    adminPage.activateOption(adminPage.allowLinksCheckBox);
  });

  it('should not be possible to reshare, if admin disabled this option', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    
    var createFile = function() {
      filesPage.createTxtFile('disabledReshare');
    };

    var createShare = function() {
      shareApi.create('disabledReshare.txt', 'demo', 0);
    };

    flow.execute(createFile);
    flow.execute(createShare);

    adminPage.getAsUser(params.login.user, params.login.password);
    adminPage.disableOption(adminPage.allowResharingCheckBox);

    filesPage.getAsUser('demo', 'password');
    expect(filesPage.checkReshareability('disabledReshare.txt')).toBeFalsy();
    adminPage.getAsUser(params.login.user, params.login.password);
    adminPage.activateOption(adminPage.allowResharingCheckBox);
  });

  // test fails in owncloud 7
  it('should show "can share" option, when admin disabled reshare option', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.openShareForm('disabledReshare.txt');
    expect(element(filesPage.disableReshareButtonId('demo')).isDisplayed()).toBeFalsy();
  });

  it('should enforce a password, when sharing a file via link, if admin wishes', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    
    filesPage.createTxtFile('enforceLinkPass');

    adminPage.get();
    adminPage.activateOption(adminPage.enforceLinkPasswordCheckBox);
    filesPage.get();
    filesPage.openShareForm('enforceLinkPass.txt');
    filesPage.shareLinkCheckBox.click();
    browser.sleep(500);
    expect(filesPage.shareLinkPassText.isDisplayed()).toBeTruthy();

    adminPage.get();
    adminPage.disableOption(adminPage.enforceLinkPasswordCheckBox);
  });

  it('should disable all share options, if admin turned off sharing', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.createTxtFile('noSharesAtAll')

    adminPage.get();
    adminPage.disableOption(adminPage.shareAPIEnabledCheckBox);

    filesPage.get();
    Page.moveMouseTo(filesPage.fileListElemId('noSharesAtAll.txt'));

    expect(element(filesPage.shareButtonId('noSharesAtAll.txt')).isPresent()).toBeFalsy();

    adminPage.get();
    adminPage.activateOption(adminPage.shareAPIEnabledCheckBox);
  });

  it('clean up', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.deleteFile('disabledReshare.txt');
    filesPage.deleteFile('enforceLinkPass.txt');
    filesPage.deleteFile('noSharesAtAll.txt');
    filesPage.get();
    expect(filesPage.listFiles()).not.toContain('noReshare');

    userPage.get();
    userPage.deleteUser('demo');
    userPage.get(); // nessesary to delete last user 
    expect(userPage.listUser()).not.toContain('demo');
  });
});