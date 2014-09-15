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

var Page = require('../helper/page.js');
var FilesPage = require('../pages/files.page.js');

// ============================ SORT ================================================================= //
// =================================================================================================== //

describe('Sort', function() {
  var params = browser.params;
  var filesPage;
  
  beforeEach(function() {
    isAngularSite(false);
    filesPage = new FilesPage(params.baseUrl);
    filesPage.getAsUser(params.login.user, params.login.password);
  });

  it('should sort files by name', function() {
    expect(filesPage.firstListElem == element(filesPage.fileListElemId("documents"))).toBeTruthy;
    filesPage.nameSortArrow.click();
    expect(filesPage.firstListElem == element(filesPage.fileListElemId("ownCouldUserManual.pdf"))).toBeTruthy;
  });

  it('should sort files by size', function() {
    expect(filesPage.firstListElem == element(filesPage.fileListElemId("documents"))).toBeTruthy;
    filesPage.sizeSortArrow.click();
    expect(filesPage.firstListElem == element(filesPage.fileListElemId("music"))).toBeTruthy;
  });

  it('should sort files by modified date', function() {
    expect(filesPage.firstListElem == element(filesPage.fileListElemId("documents"))).toBeTruthy;
    filesPage.createTxtFile('newText');
    filesPage.modifiedSortArrow.click();
    expect(filesPage.firstListElem == element(filesPage.fileListElemId("newText.txt"))).toBeTruthy;
  });
});