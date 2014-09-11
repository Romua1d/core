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

var LoginPage = require('../pages/login.page.js');
var UserPage = require('../pages/user.page.js');
var FirstRunWizardPage = require('../pages/firstRunWizard.page.js');
var Screenshot = require('../helper/screenshot.js');

describe('Authentication', function() {
  var params = browser.params;
  var loginPage;
  
  beforeEach(function() {
    isAngularSite(false);
    loginPage = new LoginPage(params.baseUrl);
    browser.manage().deleteAllCookies(); // logout the hard way
    loginPage.get();
    
    // Skip tests after first failed test
    // if (this.results_.failedCount > 0) {
    //   // Hack: Quit by filtering upcoming tests
    //   this.env.specFilter = function(spec) {
    //     return false;
    //   };
    // }
  });

  it('should show a logo', function() {
    expect(element(by.css('.logo'))).toBeDefined();
  });

  it('should load the login page', function() {
    browser.takeScreenshot().then(function (png) {
        new Screenshot(png, 'LoginPage.png');
    });

    expect(loginPage.isCurrentPage()).toBeTruthy();
  });
  
  it('should meet the locator dependencies', function() {
    expect(loginPage.loginForm.isDisplayed()).toBeTruthy();
    expect(loginPage.userInput.isDisplayed()).toBeTruthy();
    expect(loginPage.passwordInput.isDisplayed()).toBeTruthy();
    expect(loginPage.loginButton.isDisplayed()).toBeTruthy();
  });
  
  it('should not load the files page url', function() {
    expect(browser.getCurrentUrl()).not.toContain('index.php/apps/files/');
  });
  
  it('should login admin user', function() {  
    // Assumes FirstRunWizard to be disabled
    loginPage.login(params.login.user, params.login.password);
    expect(browser.getCurrentUrl()).toContain('index.php/apps/files/');      
  });

  it('should login with admin account', function() {    
    loginPage.login(params.login.user, params.login.password);
    browser.takeScreenshot().then(function (png) {
        new Screenshot(png, 'LoginAsAdmin.png');
    });
    expect(browser.getCurrentUrl()).toContain('index.php/apps/files/');
    expect(loginPage.isCurrentPage()).toBeFalsy();
  });
  
  it('should return to the login page after logout', function() {
    loginPage.login(params.login.user, params.login.password);
    expect(browser.getCurrentUrl()).not.toEqual(loginPage.url);
    
    loginPage.logout();
    expect(browser.getCurrentUrl()).toEqual(loginPage.url);
  });
  
  it('should not login with wrong credentials', function() {    
    loginPage.fillUserCredentilas('wrongName', 'wrongPass');
    loginPage.loginButton.click();
    browser.takeScreenshot().then(function (png) {
        new Screenshot(png, 'LoginWrong.png');
    });
    expect(browser.getCurrentUrl()).not.toContain('index.php/apps/files/');
    expect(loginPage.isCurrentPage()).toBeTruthy();
  });
  
  it('should have rights to visit user management after admin login', function() {    
    loginPage.login(params.login.user, params.login.password);
    userPage = new UserPage(params.baseUrl);
    userPage.get();
    expect(browser.getCurrentUrl()).toEqual(userPage.url);
  });
  
});