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

describe('Username Cases', function() {
  var params = browser.params;
  var loginPage;
  
  beforeEach(function() {
    isAngularSite(false);
    loginPage = new LoginPage(params.baseUrl);
    userPage = new UserPage(params.baseUrl);
    browser.manage().deleteAllCookies(); // logout the hard way
    loginPage.get();
  });
  
  it('setup ', function() {
    userPage.getAsUser(params.login.user, params.login.password);
    userPage.createNewUser('demo1', 'demo');
    userPage.createNewUser('Demo2', 'demo');
    userPage.createNewUser('DEMO3', 'demo').then(function() {
      browser.sleep(500);  
      expect(userPage.listUser()).toContain('demo1', 'Demo2', 'DEMO3');
    });
  });
  
  it('should login lowercase username with test user in lowercase', function() {    
    loginPage.login('demo1', 'demo');
    expect(browser.getCurrentUrl()).toContain('index.php/apps/files/');
  });
  
  it('should login camelcase username with test user in lowercase', function() {    
    loginPage.login('demo2', 'demo');
    expect(browser.getCurrentUrl()).toContain('index.php/apps/files/');
  });
  
  it('should login uppercase username with test user in lowercase', function() {    
    loginPage.login('demo3', 'demo');
    expect(browser.getCurrentUrl()).toContain('index.php/apps/files/');
  });
  
  it('should login with lowercase username in camelcase', function() {    
    loginPage.login('Demo1', 'demo');
    expect(browser.getCurrentUrl()).toContain('index.php/apps/files/');
  });
  
  it('should login with camelcase username in camelcase', function() {    
    loginPage.login('Demo2', 'demo');
    expect(browser.getCurrentUrl()).toContain('index.php/apps/files/');
  });
  
  it('should login with uppercase username in camelcase', function() {  
    loginPage.login('Demo3', 'demo');
    expect(browser.getCurrentUrl()).toContain('index.php/apps/files/');
  });
  
  it('should login with lowercase username in uppercase', function() {    
    loginPage.login('DEMO1', 'demo');
    expect(browser.getCurrentUrl()).toContain('index.php/apps/files/');
  });
  
  it('should login with lowercase username in uppercase', function() {   
    loginPage.login('DEMO2', 'demo');
    expect(browser.getCurrentUrl()).toContain('index.php/apps/files/');
  });
  
  it('should login with lowercase username in uppercase', function() {   
    loginPage.login('DEMO3', 'demo');
    expect(browser.getCurrentUrl()).toContain('index.php/apps/files/');
  });
  
  it('should login as admin and delete test user', function() {    
    // Cleanup prev tests
    userPage.getAsUser(params.login.user, params.login.password);
    userPage.deleteUser('demo1');
    userPage.deleteUser('Demo2');
    userPage.deleteUser('DEMO3');
    userPage.get();
    expect(userPage.listUser()).not.toContain('demo1');
    expect(userPage.listUser()).not.toContain('Demo2');
    expect(userPage.listUser()).not.toContain('DEMO3' );
  });
  
});