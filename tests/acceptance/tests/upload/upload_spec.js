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
var FilesPage = require('../pages/files.page.js');
var Uploader = require('../helper/uploader.js');

describe('Upload', function() {
  var params = browser.params;
  var filesPage;
  var uploader;

  beforeEach(function() {
    isAngularSite(false);
    filesPage = new FilesPage(params.baseUrl);
    uploader = new Uploader();
    filesPage.getAsUser(params.login.user, params.login.password);
  });

  it('should upload a file', function() {
    uploader.upload('test.txt');

    // filesPage.uploadButton.sendKeys('aaa');

    // filesPage.uploadButton.sendKeys();
  });

});