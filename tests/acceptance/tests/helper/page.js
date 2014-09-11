/*
 * Copyright (c) 2014
 *
 * This file is licensed under the Affero General Public License version 3
 * or later.
 *
 * See the COPYING-README file.
 *
 */

/* global protractor, module, element, by, browser */

(function() {
  var LoginPage = require('../pages/login.page.js');
  var params = browser.params;
	var Page = function() {
    this.displayName = element(by.id("expandDisplayName"));
    this.userActionDropdown = element(by.id('expanddiv'));
    this.settingUsers = element(by.css('a[href="/ownclouds/owncloud-community-7.0.2/index.php/settings/users"]'));
    this.settingPersonal = element(by.css('a[href="/ownclouds/owncloud-community-7.0.2/index.php/settings/personal"]'));
	};

	Page.prototype.moveMouseTo = function(locator) {
		var ele = element(locator);
		return browser.actions().mouseMove(ele).perform();
	};

	Page.toggleAppsMenu = function() {
		var el = element(this.appsMenuId());
		return el.click();
	};

	Page.logout = function() {
		element(Page.settingsMenuId()).click();
		element(by.id('logout')).click();
		browser.sleep(300);
	};

	//================ LOCATOR FUNCTIONS ====================================//
	Page.appsMenuId = function() {
		return by.css('#header .menutoggle');
	};

	Page.appMenuEntryId = function(appId) {
		return by.css('nav #apps [data-id=\'' + appId + '\']');
	};

	Page.settingsMenuId = function() {
		return by.css('#header #settings');
	};

	//================ UTILITY FUNCTIONS ====================================//

	/**
	 * Sets the selection of a multiselect element
	 *
	 * @param el select element of the multiselect
	 * @param {Array} id of the values to select
	 */
  Page.multiSelectSetSelection = function(el, selection) {
    var d = protractor.promise.defer();
    var dropDownEl = element(by.css('.multiselectoptions.down'));

    el.click();

    function processEntry(entry) {
      entry.isSelected().then(function(selected) {
        entry.getAttribute('id').then(function(inputId) {
          // format is "ms0-option-theid", we extract that id
          var dataId = inputId.split('-')[2];
          var mustBeSelected = selection.indexOf(dataId) >= 0;
          // if state doesn't match what we want, toggle

          if (selected !== mustBeSelected) {
            // need to click on the label, not input
            entry.element(by.xpath('following-sibling::label')).click();
            // confirm that the checkbox was set
            browser.wait(function() {
              return entry.isSelected().then(function(newSelection) {
                return newSelection === mustBeSelected;
              });
            });
          }
        });
      });
    }

    browser.wait(function() {
      return dropDownEl.isPresent();
    }, 1000).then(function() {
      dropDownEl.all(by.css('[type=checkbox]')).then(function(entries) {
        for (var i = 0; i < entries.length; i++) {
          processEntry(entries[i]);
        }
        // give it some time to save changes
        browser.sleep(300).then(function() {
          d.fulfill(true);
        });
      });
    });

    return d.promise;
  };


//================ LOCATOR FUNCTIONS ===================================================//
//======================================================================================//

  // topbar
  Page.displayNameId = function() {
   return by.id("expandDisplayName");
  } 
  
  Page.userActionDropdownId = function() {
   return by.id('expanddiv');
  } 
  
  // Page.settingUsersId = function() {
  //  return by.css("a[href='" +  params.baseUrl + "settings/users']");
  // } 

  // Page.settingPersonalId = function() {
  //  return by.css("a[href='" +  params.baseUrl + "settings/personal']");
  // } 

//================ PAGE NAVIGATION =====================================================//
//======================================================================================//

  Page.isLoggedIn = function() {
    return element(this.displayNameId()).isPresent().then(function(isLoggedIn) {
      return isLoggedIn;
    });
  }

  Page.getAsUser = function(name, pass, url) { 
    if(url == undefined) {
      url = params.baseUrl;
    };

    return this.isLoggedIn().then(function(isLoggedIn) {
      if( ! isLoggedIn) {
        var loginPage = new LoginPage(params.baseUrl);
        return loginPage.get().then(function() {
          return loginPage.login(name, pass).then(function() {
            return browser.get(url);
          });
        });
      } else {
        return browser.get(url);
      };
    });
  };

//================ MOUSE ACTIONS =======================================================//
//======================================================================================//

  Page.moveMouseTo = function(locator) {
    var elem = element(locator);
    browser.actions().mouseMove(elem).perform();
    return browser.wait(function() {
      return element(by.css('td:hover')).isDisplayed();
    });
  };

  Page.dragAndDrop = function (locator1, locator2) {
    this.moveMouseTo(locator1);
    browser.actions().mouseDown().perform();
    this.moveMouseTo(locator2);
    browser.actions().mouseUp().perform();
  };

	module.exports = Page;
})();
