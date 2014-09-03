(function() {  
  var Page = require('../helper/page.js');

  var UserPage = function(baseUrl) {
    this.baseUrl = baseUrl;
    this.path = 'index.php/settings/users';
    this.url = baseUrl + this.path;
    
    this.newUserNameInput = element(by.id('newusername'));
    this.newUserPasswordInput = element(by.id('newuserpassword'));
    this.createNewUserButton = element(by.css('#newuser input[type="submit"]')); 

    this.newGroupButton = element(by.css('#newgroup-init a'));
    this.newGroupNameInput = element(by.css('#newgroup-form input#newgroupname'));

    this.userFilter = element(by.css('.userFilter'));

    this.warningDialog = element(by.css('.oc-dialog'));
  };

// ================ LOCATORS ==================================================================== //
// ============================================================================================== //

  UserPage.prototype.renameDisplayNameButtonId = function(userName) {
    return by.css("tr[data-uid='" + userName + "'] td.displayName");
  };

  UserPage.prototype.renameDisplayNameFormId = function(userName) {
    return by.css("tr[data-uid='" + userName + "'] td.displayName input");
  };

  UserPage.prototype.userPassButtonId = function(userName) {
    return by.css('#userlist tr[data-uid="' + userName + '"] td.password');
  };

  UserPage.prototype.userPassFormId = function(userName) {
    return by.css('#userlist tr[data-uid="' + userName + '"] td.password input');
  };
  
  UserPage.prototype.removeUserButtonId = function(userName) {
    return by.css('#userlist tr[data-uid="' + userName + '"] td.remove a');
  };


// ================ ACTIONS ===================================================================== //
// ============================================================================================== //

  UserPage.prototype.get = function() {
    browser.get(this.url);
  };
  
  UserPage.prototype.isUserPage = function() {
    return browser.driver.getCurrentUrl() == this.url;
  };
  
  UserPage.prototype.ensureUserPage = function() {
    // console.log(this.isUserPage());
    // if (! this.isUserPage()) {
    //   display.log('Warning: Auto loading UserPage');
    //   this.get();
    // }
  };
  
  UserPage.prototype.fillNewUserInput = function(user, pass) {
    this.ensureUserPage();
    this.newUserNameInput.sendKeys(user);
    browser.sleep(100);
    this.newUserPasswordInput.sendKeys(pass);
  };
  
  UserPage.prototype.createNewUser = function(user, pass) {
    this.fillNewUserInput(user, pass);
    this.createNewUserButton.click();
  };
  
  UserPage.prototype.deleteUser = function(userName) {
    var page = new Page();
    var deleteButton = element(this.removeUserButtonId(userName));

    page.moveMouseTo(this.removeUserButtonId(userName));
    deleteButton.click();
    
    // var filter = browser.findElement(removeId);
    // var scrollIntoView = function () {
    //   arguments[0].scrollIntoView();
    // }
    // browser.executeScript(scrollIntoView, filter).then(function () {
    //   browser.actions().mouseMove(browser.findElement(removeId)).perform();
    //   element(removeId).click();
    // });
  };

  UserPage.prototype.changeUserPass = function(userName, pass) {
    var passForm = element(this.userPassFormId(userName));

    element(this.userPassButtonId(userName)).click().then(function() {
      passForm.sendKeys(pass);
      passForm.sendKeys(protractor.Key.ENTER);
    });
  }

  UserPage.prototype.setCurrentListElem = function(name) {
    return element(by.css("tr[data-uid='" + name + "']"));
  }

  UserPage.prototype.renameDisplayName = function(userName, newUserName) {
    var renameDisplayNameButton = element(this.renameDisplayNameButtonId(userName));
    renameDisplayNameButton.click();
    var renameDisplayNameForm = element(this.renameDisplayNameFormId(userName));
    // TODO: Workaround, fixme
    renameDisplayNameForm.sendKeys(protractor.Key.DELETE);
    renameDisplayNameForm.sendKeys(protractor.Key.DELETE);
    renameDisplayNameForm.sendKeys(protractor.Key.DELETE);
    renameDisplayNameForm.sendKeys(protractor.Key.DELETE);
    renameDisplayNameForm.sendKeys(protractor.Key.DELETE);
    renameDisplayNameForm.sendKeys(protractor.Key.DELETE);
    
    renameDisplayNameForm.sendKeys(newUserName);
    renameDisplayNameForm.sendKeys(protractor.Key.ENTER);
  };
  
  UserPage.prototype.listUser = function() {
    this.ensureUserPage();
    return element.all(by.css('td.displayName')).map(function(user) {
      return user.getText();
    });
  };
  
  UserPage.prototype.createNewGroup = function(name) {
    this.newGroupButton.click();
    var newGroupNameInput = this.newGroupNameInput;
    browser.wait(function() {
      return newGroupNameInput.isDisplayed();
    }, 3000);
    this.newGroupNameInput.sendKeys(name);
    this.newGroupNameInput.sendKeys(protractor.Key.ENTER);
  };

///// NOT WORKING, CLICK ON CHECKBOX RESEIVES AN OTHER ELEMENT //////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // UserPage.prototype.setUserGroup = function(userName, groupName) {
  //   var renameDisplayNameButton = element(by.css("tr[data-uid='" + userName + "'] td.groups .multiselect.button"));
  //   renameDisplayNameButton.click();

  //   var a = 'tr[data-uid="' + userName + '"] ul.multiselectoptions.down';

  //   var dropdown = element(by.css(a));
  //   browser.wait(function() {
  //     return dropdown.isDisplayed();
  //   }, 3000);
  //   browser.pause();
  //   var checkboxId = by.css('tr[data-uid="' + userName + '"] ul.multiselectoptions.down label');
  //   element.all(checkboxId).each(function(checkbox) {
  //     checkbox.getText().then(function(text) {
  //       console.log(checkboxId);
  //       console.log(text);
  //       if(text == groupName) {
  //         return checkbox.click();
  //       }
  //     })
  //   });
  // };

  module.exports = UserPage;
})();