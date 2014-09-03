var LoginPage = require('../pages/login.page.js');
var UserPage = require('../pages/user.page.js');
var FilesPage = require('../pages/files.page.js');
var AdminPage = require('../pages/admin.page.js');
var Page = require('../helper/page.js');

var ShareApi = require('../pages/share_api.page.js');
var parseXml = require('xml2js').parseString;
var flow = protractor.promise.controlFlow();


describe('Share', function() {
  var params = browser.params;
  var loginPage;
  var userPage;
  var filesPage;
  var adminPage;
  var page;
  var shareApi;

  beforeEach(function() {
    isAngularSite(false);
    loginPage = new LoginPage(params.baseUrl);
    userPage = new UserPage(params.baseUrl);
    filesPage = new FilesPage(params.baseUrl);
    adminPage = new AdminPage(params.baseUrl);
    page = new Page();
    shareApi = new ShareApi(params.baseUrl);
  });

  it('should login as admin and create 4 new users', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    // userPage.get();
    // userPage.createNewGroup('test_specGroup_1');
    userPage.get();
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
    filesPage.get();
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.createNewFolder('toShare_1');
    browser.sleep(500);
    filesPage.shareFile('toShare_1', 'demo');

    loginPage.logout();
    loginPage.login('demo', 'password');
    expect(filesPage.listFiles()).toContain('toShare_1');
    loginPage.logout();
  });

  it('should share a folder including special characters', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.createNewFolder('sP€c!@L');
    browser.sleep(500);
    filesPage.shareFile('sP€c!@L', 'demo');

    loginPage.logout();
    loginPage.login('demo', 'password');
    expect(filesPage.listFiles()).toContain('sP€c!@L');
    loginPage.logout();
  });

  it('should share a folder with 3 another user by display name', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.createNewFolder('toShare_2');
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

    loginPage.logout();
    loginPage.login('demo4', 'password');
    expect(filesPage.listFiles()).toContain('toShare_2');

    loginPage.logout();
    loginPage.login('demo3', 'password');
    expect(filesPage.listFiles()).toContain('toShare_2');

    loginPage.logout();
    loginPage.login('demo2', 'password');
    expect(filesPage.listFiles()).toContain('toShare_2');
  });

  it('should grant second users CRUDS rights to their folder', function() {
    filesPage.getAsUser('demo2', 'password');
    filesPage.getFolder('toShare_2');

    //create file
    filesPage.createNewTxtFile('inSharedBySecond');
    filesPage.createNewTxtFile('toBeDeleted');
    expect(filesPage.listFiles()).toContain('inSharedBySecond' ,'toBeDeleted');

    //delete file
    filesPage.deleteFile('toBeDeleted.txt');
    browser.sleep(800);
    expect(filesPage.listFiles()).not.toContain('toBeDeleted');
    

    //share file
    filesPage.shareFile('inSharedBySecond.txt', 'demo');

    loginPage.logout();
    loginPage.login('demo', 'password');
    filesPage.renameFile('inSharedBySecond.txt', 'renamedBySecond.txt')
    expect(filesPage.listFiles()).toContain('renamedBySecond');
    filesPage.deleteFile('renamedBySecond.txt');
    loginPage.logout()
  });

  it('should delete the root folder shared with a user account by another user', function() {
    filesPage.getAsUser('demo2', 'password');
    filesPage.deleteFile('toShare_2');
    browser.sleep(800);
    expect(filesPage.listFiles()).not.toContain('toShare_2');

    loginPage.logout();
    loginPage.login(params.login.user, params.login.password);
    expect(filesPage.listFiles()).toContain('toShare_2');
  });

  it('should delete a file shared with a user, only form user if user deletes it', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
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

  it('should delete a file in a shared folder, from all', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.getFolder('toShare_1');
    filesPage.createNewTxtFile('toDeleteFromAll');

    loginPage.logout();
    loginPage.login('demo', 'password');
    filesPage.getFolder('toShare_1');
    filesPage.deleteFile('toDeleteFromAll.txt');
    browser.sleep(800);
    expect(filesPage.listFiles()).not.toContain('toDeleteFormAll');

    loginPage.logout();
    loginPage.login(params.login.user, params.login.password);
    filesPage.getFolder('toShare_1');
    expect(filesPage.listFiles()).not.toContain('toDeleteFromAll');
  });

  it('should delete a file shared with a user, form all if owner deletes it', function() {
    filesPage.get();
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.createNewTxtFile('toDeleteByOwner');
    filesPage.shareFile('toDeleteByOwner.txt', 'demo');

    loginPage.logout();
    loginPage.login('demo', 'password');
    expect(filesPage.listFiles()).toContain('toDeleteByOwner');

    loginPage.logout();
    loginPage.login(params.login.user, params.login.password);
    filesPage.deleteFile('toDeleteByOwner.txt');
  
    loginPage.logout();
    loginPage.login('demo', 'password');
    expect(filesPage.listFiles()).not.toContain('toDeleteByOwner');
    loginPage.logout();

  });

  it('should not be possible to reshare a folder, if the "re-share" option is removed', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.createNewFolder('noReshare');
    filesPage.shareFile('noReshare', 'demo');
    filesPage.disableReshare('noReshare', 'demo');
  
    loginPage.logout();
    loginPage.login('demo', 'password');

    expect(filesPage.checkReshareability('noReshare')).toBeFalsy();
  });

  it('should not be possible to modify a file shared without edit privileges', function() {
    loginPage.logout
    filesPage.getAsUser(params.login.user, params.login.password);

    var createFile = function() {
      filesPage.createNewTxtFile('noEdits')
    };
    var createShare = function() {
      return shareApi.create('noEdits.txt', 'demo', 0);
    };

    flow.execute(createFile);
    flow.execute(createShare);
    filesPage.disableEdit('noEdits.txt', 'demo');
    filesPage.editTxtFile('noEdits.txt', 'No Edits by User!');

    loginPage.logout();
    loginPage.login('demo', 'password');
    filesPage.openFile('noEdits.txt');
    expect(element(filesPage.saveButtonId).toBeDisplayed).toBeFalsy();
  });

  it('should change file, when user (not the owner) with privileges edits it', function() {
    loginPage.logout
    filesPage.getAsUser(params.login.user, params.login.password);

    var createFile = function() {
      filesPage.createNewTxtFile('userEdits')
    };
    var createShare = function() {
      return shareApi.create('userEdits.txt', 'demo', 0);
    };

    flow.execute(createFile);
    flow.execute(createShare);

    loginPage.logout();
    loginPage.login('demo', 'password');
    filesPage.editTxtFile('userEdits.txt', 'User made edits!');
    
    loginPage.logout();
    loginPage.login(params.login.user, params.login.password);
    filesPage.openFile('userEdits.txt');    
    expect(filesPage.getTextContent()).toEqual('User made edits!')
    filesPage.deleteFile('userEdits.txt');
  });

  it('should change file for all users, when owner edits shared file', function() {
    filesPage.getAsUser(params.login.user, params.login.password);

    var createFile = function() {
      filesPage.createNewTxtFile('ownerEdits')
    };
    var createShare = function() {
      return shareApi.create('ownerEdits.txt', 'demo', 0);
    };

    flow.execute(createFile);
    flow.execute(createShare);
    filesPage.editTxtFile('ownerEdits.txt', 'Owner made edits!');

    loginPage.logout();
    loginPage.login('demo', 'password');
    
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
      filesPage.createNewFolder('sharedFolder');
      filesPage.getFolder('sharedFolder');
      filesPage.createNewTxtFile('sharedFile');
      filesPage.createNewTxtFile('otherSharedFile');
      filesPage.createNewFolder('folderInSharedFolder');
      filesPage.createNewFolder('otherFolderInSharedFolder');
    };

    var createShare = function() {
      shareApi.create('sharedFolder', 'demo', 0);
    };
   
    flow.execute(createFiles);
    flow.execute(createShare);

    loginPage.logout();
    loginPage.login('demo', 'password');

    filesPage.getFolder('sharedFolder');
    var sharedFile = element(filesPage.permanentShareButtonId('sharedFile.txt'));
    var otherSharedFile = element(filesPage.permanentShareButtonId('otherSharedFile.txt'));
    var folderInSharedFolder = element(filesPage.permanentShareButtonId('folderInSharedFolder'));
    var otherFolderInSharedFolder = element(filesPage.permanentShareButtonId('otherFolderInSharedFolder'));

    expect(sharedFile.isDisplayed()).toBeTruthy();
    expect(otherSharedFile.isDisplayed()).toBeTruthy();
    expect(folderInSharedFolder.isDisplayed()).toBeTruthy();
    expect(otherFolderInSharedFolder.isDisplayed()).toBeTruthy();
  });

  it('should rename a shared folder and it keeps being shared', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.renameFile('folderInSharedFolder', 'renamedSharedFolder');

    var renamedSharedFolder = element(filesPage.permanentShareButtonId('renamedSharedFolder'));
    expect(renamedSharedFolder.isDisplayed()).toBeTruthy();
  });

  it('should share a file, if it is moved in a shared folder', function() {
    filesPage.getAsUser(params.login.user, params.login.password); 
    var createFolder = function() {
    filesPage.createNewFolder('moveItIn');
    filesPage.createNewTxtFile('moveMeIn');
    };

    var createShare = function() {
      shareApi.create('moveItIn', 'demo', 0);
    };

    flow.execute(createFolder);
    flow.execute(createShare);

    page.dragAndDrop(filesPage.fileListElemId('moveMeIn.txt'), filesPage.fileListElemId('moveItIn'));
    filesPage.getFolder('moveItIn');
    var sharedIcon = element(filesPage.permanentShareButtonId('moveMeIn.txt'));
    expect(sharedIcon.isDisplayed()).toBeTruthy();
    filesPage.deleteFile('moveItIn');
  });

  it('should rename a shared folder and the folder stays shared', function() {
    filesPage.getAsUser(params.login.user, params.login.password); 
    var createFolder = function() {
    filesPage.createNewFolder('sharedFolder3');
    };

    var createShare = function() {
      shareApi.create('sharedFolder3', 'demo', 0);
    };

    flow.execute(createFolder);
    flow.execute(createShare);
    loginPage.logout();
    loginPage.login('demo', 'password');
    filesPage.renameFile('sharedFolder3', 'renamedSharedFolder');
    browser.sleep(500);
    expect(element(filesPage.permanentShareButtonId('renamedSharedFolder')).isDisplayed()).toBeTruthy();
  });

  it('should have access to a shared subfolder', function() {
    filesPage.getAsUser(params.login.user, params.login.password); 
    var protrac = protractor.getInstance();
    var createFolder = function() {
      filesPage.createNewFolder('sharedFolder4');
      filesPage.getFolder('sharedFolder4');
      filesPage.createNewFolder('subFolder');
    };
    var createShare = function() {
      shareApi.create('sharedFolder4', 'demo', 0);
    };

    flow.execute(createFolder);
    flow.execute(createShare);
    loginPage.logout();
    loginPage.login('demo', 'password');
    filesPage.getSubFolder('sharedFolder4', 'subFolder');

    var expectedUrl = filesPage.folderUrl('sharedFolder4' + '%2F' + 'subFolder');

    protrac.getCurrentUrl().then(function(url) {
      expect(expectedUrl).toEqual(url);
    });
  })

});


describe('Admin configs Share', function() {
  var params = browser.params;
  var loginPage;
  var userPage
  var filesPage;
  var adminPage;
  var page;
  var shareApi;

  beforeEach(function() {
    isAngularSite(false);
    loginPage = new LoginPage(params.baseUrl);
    userPage = new UserPage(params.baseUrl);
    filesPage = new FilesPage(params.baseUrl);
    adminPage = new AdminPage(params.baseUrl);
    page = new Page();
    shareApi = new ShareApi(params.baseUrl);
  });

  it('should not be possible to share via link, if admin disabled this option', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    adminPage.get();
    adminPage.disableOption(adminPage.allowLinksCheckBox);
    filesPage.get();
    filesPage.openShareForm('ownerEdits.txt');
    expect(filesPage.shareLinkCheckBox.toBeDisplayed()).toBeFalsy();

    adminPage.get();
    adminPage.activateOption(adminPage.allowLinksCheckBox);
  });

  it('should not be possible to reshare, if admin disabled this option', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    
    var createFile = function() {
      filesPage.createNewTxtFile('disabledReshare');
    };

    var createShare = function() {
      shareApi.create('disabledReshare.txt', 'demo', 0);
    };

    flow.execute(createFile);
    flow.execute(createShare);

    adminPage.get();
    adminPage.disableOption(adminPage.allowResharingCheckBox);
    loginPage.logout();
    loginPage.login('demo', 'password');
    expect(filesPage.checkReshareability('disabledReshare.txt')).toBeFalsy();
    loginPage.logout();
  });

  it('should show "can share" option, when admin disabled reshare option', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    filesPage.openShareForm('disabledReshare.txt');
    expect(element(filesPage.disableReshareButtonId('demo')).isDisplayed()).toBeFalsy();
  });

  it('should enforce a password, when sharing a file via link, if admin wishes', function() {
    filesPage.getAsUser(params.login.user, params.login.password);
    
    filesPage.createNewTxtFile('enforceLinkPass');

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
    filesPage.get();
    filesPage.createNewTxtFile('noSharesAtAll')

    adminPage.get();
    adminPage.disableOption(adminPage.shareAPIEnabledCheckBox);

    filesPage.get();
    page.moveMouseTo(filesPage.fileListElemId('noSharesAtAll.txt'));

    expect(element(filesPage.shareButtonId('noSharesAtAll.txt')).isPresent()).toBeFalsy();

    adminPage.get();
    adminPage.activateOption(adminPage.shareAPIEnabledCheckBox);
  });
});