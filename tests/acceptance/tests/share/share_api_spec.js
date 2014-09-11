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

var Page = require('../helper/page.js');
var ShareApi = require('../pages/share_api.page.js');
var UserPage = require('../pages/user.page.js');
var FilesPage = require('../pages/files.page.js');
var parseXml = require('xml2js').parseString;

var flow = protractor.promise.controlFlow();

describe('Share Api', function() {
  var params = browser.params;
  var shareApi;
  var userPage;
  var filesPage;

  beforeEach(function() {
    isAngularSite(false);
    shareApi = new ShareApi(params.baseUrl);
    userPage = new UserPage(params.baseUrl);
    filesPage = new FilesPage(params.baseUrl);
  });

  it('setup', function() {
    userPage.getAsUser(params.login.user, params.login.password);
    userPage.createNewUser('demo', 'password');
    userPage.createNewUser('demo2', 'password');
    expect(userPage.listUser()).toContain('demo', 'demo2');
    filesPage.get();
    filesPage.createFolder('testFolder');
    expect(filesPage.listFiles()).toContain('testFolder');
  });

  it('should get all shares', function() {
    var get = function () {
      return shareApi.get();
    };

    flow.execute(get).then(function(res){
      parseXml(res.body, function (err, result) {
        console.dir(result.ocs.data);
      });
      expect(res.statusCode).toEqual(200);
    });
  });

  it('should create a new share', function() {
    var create = function () {
      return shareApi.create('music', 'demo2', 0);
    };

    flow.execute(create).then(function(res){
      parseXml(res.body, function (err, result) {
        console.log(result.ocs.data, result.ocs.meta);
        expect(result.ocs.meta[0].statuscode[0]).toEqual('100');
      });
    });
  });

  it('clean up', function() {
    userPage.getAsUser(params.login.user, params.login.password);
    userPage.deleteUser('demo');
    userPage.deleteUser('demo2');
    expect(userPage.listUser()).not.toContain('demo', 'demo2');
    filesPage.get();
    filesPage.deleteFolder('testFolder');
    expect(filesPage.listFiles()).not.toContain('testFolder');
  });
});