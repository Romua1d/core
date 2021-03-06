<?php
/**
 * Copyright (c) 2012 Sam Tuke <samtuke@owncloud.com>, and
 * Robin Appelman <icewind@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

use OCA\Encryption;

/**
 * Class Test_Encryption_Crypt
 */
class Test_Encryption_Crypt extends \PHPUnit_Framework_TestCase {

	const TEST_ENCRYPTION_CRYPT_USER1 = "test-crypt-user1";

	public $userId;
	public $pass;
	public $stateFilesTrashbin;
	public $dataLong;
	public $dataUrl;
	public $dataShort;
	/**
	 * @var OC\Files\View
	 */
	public $view;
	public $legacyEncryptedData;
	public $genPrivateKey;
	public $genPublicKey;

	public static function setUpBeforeClass() {
		// reset backend
		\OC_User::clearBackends();
		\OC_User::useBackend('database');

		// Filesystem related hooks
		\OCA\Encryption\Helper::registerFilesystemHooks();

		// Filesystem related hooks
		\OCA\Encryption\Helper::registerUserHooks();

		// clear and register hooks
		\OC_FileProxy::clearProxies();
		\OC_FileProxy::register(new OCA\Encryption\Proxy());

		// create test user
		\Test_Encryption_Util::loginHelper(\Test_Encryption_Crypt::TEST_ENCRYPTION_CRYPT_USER1, true);
	}

	function setUp() {
		// set user id
		\Test_Encryption_Util::loginHelper(\Test_Encryption_Crypt::TEST_ENCRYPTION_CRYPT_USER1);
		$this->userId = \Test_Encryption_Crypt::TEST_ENCRYPTION_CRYPT_USER1;
		$this->pass = \Test_Encryption_Crypt::TEST_ENCRYPTION_CRYPT_USER1;

		// set content for encrypting / decrypting in tests
		$this->dataLong = file_get_contents(__DIR__ . '/../lib/crypt.php');
		$this->dataShort = 'hats';
		$this->dataUrl = __DIR__ . '/../lib/crypt.php';
		$this->legacyData = __DIR__ . '/legacy-text.txt';
		$this->legacyEncryptedData = __DIR__ . '/legacy-encrypted-text.txt';
		$this->legacyEncryptedDataKey = __DIR__ . '/encryption.key';
		$this->randomKey = Encryption\Crypt::generateKey();

		$keypair = Encryption\Crypt::createKeypair();
		$this->genPublicKey = $keypair['publicKey'];
		$this->genPrivateKey = $keypair['privateKey'];

		$this->view = new \OC\Files\View('/');

		// remember files_trashbin state
		$this->stateFilesTrashbin = OC_App::isEnabled('files_trashbin');

		// we don't want to tests with app files_trashbin enabled
		\OC_App::disable('files_trashbin');
	}

	function tearDown() {
		// reset app files_trashbin
		if ($this->stateFilesTrashbin) {
			OC_App::enable('files_trashbin');
		} else {
			OC_App::disable('files_trashbin');
		}

		$this->assertTrue(\OC_FileProxy::$enabled);
		\OCP\Config::deleteSystemValue('cipher');
	}

	public static function tearDownAfterClass() {
		// cleanup test user
		\OC_User::deleteUser(\Test_Encryption_Crypt::TEST_ENCRYPTION_CRYPT_USER1);

		\OC_Hook::clear();
		\OC_FileProxy::clearProxies();

		// Delete keys in /data/
		$view = new \OC\Files\View('/');
		$view->rmdir('public-keys');
		$view->rmdir('owncloud_private_key');
	}

	/**
	 * @medium
	 */
	function testGenerateKey() {

		# TODO: use more accurate (larger) string length for test confirmation

		$key = Encryption\Crypt::generateKey();

		$this->assertTrue(strlen($key) > 16);

	}

	function testDecryptPrivateKey() {

		// test successful decrypt
		$crypted = Encryption\Crypt::symmetricEncryptFileContent($this->genPrivateKey, 'hat');

		$header = Encryption\Crypt::generateHeader();

		$decrypted = Encryption\Crypt::decryptPrivateKey($header . $crypted, 'hat');

		$this->assertEquals($this->genPrivateKey, $decrypted);

		//test private key decrypt with wrong password
		$wrongPasswd = Encryption\Crypt::decryptPrivateKey($crypted, 'hat2');

		$this->assertEquals(false, $wrongPasswd);

	}


	/**
	 * @medium
	 */
	function testSymmetricEncryptFileContent() {

		# TODO: search in keyfile for actual content as IV will ensure this test always passes

		$crypted = Encryption\Crypt::symmetricEncryptFileContent($this->dataShort, 'hat');

		$this->assertNotEquals($this->dataShort, $crypted);


		$decrypt = Encryption\Crypt::symmetricDecryptFileContent($crypted, 'hat');

		$this->assertEquals($this->dataShort, $decrypt);

	}

	/**
	 * @medium
	 */
	function testSymmetricEncryptFileContentAes128() {

		# TODO: search in keyfile for actual content as IV will ensure this test always passes

		$crypted = Encryption\Crypt::symmetricEncryptFileContent($this->dataShort, 'hat', 'AES-128-CFB');

		$this->assertNotEquals($this->dataShort, $crypted);


		$decrypt = Encryption\Crypt::symmetricDecryptFileContent($crypted, 'hat', 'AES-128-CFB');

		$this->assertEquals($this->dataShort, $decrypt);

	}

	/**
	 * @medium
	 */
	function testSymmetricStreamEncryptShortFileContent() {

		$filename = 'tmp-' . uniqid() . '.test';

		$cryptedFile = file_put_contents('crypt:///' . $this->userId . '/files/'. $filename, $this->dataShort);

		// Test that data was successfully written
		$this->assertTrue(is_int($cryptedFile));

		// Disable encryption proxy to prevent recursive calls
		$proxyStatus = \OC_FileProxy::$enabled;
		\OC_FileProxy::$enabled = false;

		// Get file contents without using any wrapper to get it's actual contents on disk
		$retreivedCryptedFile = $this->view->file_get_contents($this->userId . '/files/' . $filename);

		// Re-enable proxy - our work is done
		\OC_FileProxy::$enabled = $proxyStatus;

		// Check that the file was encrypted before being written to disk
		$this->assertNotEquals($this->dataShort, $retreivedCryptedFile);

		// Get file contents with the encryption wrapper
		$decrypted = file_get_contents('crypt:///' . $this->userId . '/files/'. $filename);

		// Check that decrypted data matches
		$this->assertEquals($this->dataShort, $decrypted);

		// Teardown
		$this->view->unlink($this->userId . '/files/' . $filename);

		Encryption\Keymanager::deleteFileKey($this->view, $filename);
	}

	/**
	 * @medium
	 */
	function testSymmetricStreamEncryptShortFileContentAes128() {

		$filename = 'tmp-' . uniqid() . '.test';

		\OCP\Config::setSystemValue('cipher', 'AES-128-CFB');

		$cryptedFile = file_put_contents('crypt:///' . $this->userId . '/files/'. $filename, $this->dataShort);

		// Test that data was successfully written
		$this->assertTrue(is_int($cryptedFile));

		\OCP\Config::deleteSystemValue('cipher');

		// Disable encryption proxy to prevent recursive calls
		$proxyStatus = \OC_FileProxy::$enabled;
		\OC_FileProxy::$enabled = false;

		// Get file contents without using any wrapper to get it's actual contents on disk
		$retreivedCryptedFile = $this->view->file_get_contents($this->userId . '/files/' . $filename);

		// Re-enable proxy - our work is done
		\OC_FileProxy::$enabled = $proxyStatus;

		// Check that the file was encrypted before being written to disk
		$this->assertNotEquals($this->dataShort, $retreivedCryptedFile);

		// Get file contents with the encryption wrapper
		$decrypted = file_get_contents('crypt:///' . $this->userId . '/files/'. $filename);

		// Check that decrypted data matches
		$this->assertEquals($this->dataShort, $decrypted);

		// Teardown
		$this->view->unlink($this->userId . '/files/' . $filename);

		Encryption\Keymanager::deleteFileKey($this->view, $filename);
	}

	/**
	 * @medium
	 * Test that data that is written by the crypto stream wrapper
	 * @note Encrypted data is manually prepared and decrypted here to avoid dependency on success of stream_read
	 * @note If this test fails with truncate content, check that enough array slices are being rejoined to form $e, as the crypt.php file may have gotten longer and broken the manual
	 * reassembly of its data
	 */
	function testSymmetricStreamEncryptLongFileContent() {

		// Generate a a random filename
		$filename = 'tmp-' . uniqid() . '.test';

		// Save long data as encrypted file using stream wrapper
		$cryptedFile = file_put_contents('crypt:///' . $this->userId . '/files/' . $filename, $this->dataLong . $this->dataLong);

		// Test that data was successfully written
		$this->assertTrue(is_int($cryptedFile));

		// Disable encryption proxy to prevent recursive calls
		$proxyStatus = \OC_FileProxy::$enabled;
		\OC_FileProxy::$enabled = false;

		// Get file contents without using any wrapper to get it's actual contents on disk
		$retreivedCryptedFile = $this->view->file_get_contents($this->userId . '/files/' . $filename);

		// Re-enable proxy - our work is done
		\OC_FileProxy::$enabled = $proxyStatus;


		// Check that the file was encrypted before being written to disk
		$this->assertNotEquals($this->dataLong . $this->dataLong, $retreivedCryptedFile);

		$decrypted = file_get_contents('crypt:///' . $this->userId . '/files/'. $filename);

		$this->assertEquals($this->dataLong . $this->dataLong, $decrypted);

		// Teardown

		$this->view->unlink($this->userId . '/files/' . $filename);

		Encryption\Keymanager::deleteFileKey($this->view, $filename);

	}

	/**
	 * @medium
	 * Test that data that is written by the crypto stream wrapper with AES 128
	 * @note Encrypted data is manually prepared and decrypted here to avoid dependency on success of stream_read
	 * @note If this test fails with truncate content, check that enough array slices are being rejoined to form $e, as the crypt.php file may have gotten longer and broken the manual
	 * reassembly of its data
	 */
	function testSymmetricStreamEncryptLongFileContentAes128() {

		// Generate a a random filename
		$filename = 'tmp-' . uniqid() . '.test';

		\OCP\Config::setSystemValue('cipher', 'AES-128-CFB');

		// Save long data as encrypted file using stream wrapper
		$cryptedFile = file_put_contents('crypt:///' . $this->userId . '/files/' . $filename, $this->dataLong . $this->dataLong);

		// Test that data was successfully written
		$this->assertTrue(is_int($cryptedFile));

		// Disable encryption proxy to prevent recursive calls
		$proxyStatus = \OC_FileProxy::$enabled;
		\OC_FileProxy::$enabled = false;

		\OCP\Config::deleteSystemValue('cipher');

		// Get file contents without using any wrapper to get it's actual contents on disk
		$retreivedCryptedFile = $this->view->file_get_contents($this->userId . '/files/' . $filename);

		// Re-enable proxy - our work is done
		\OC_FileProxy::$enabled = $proxyStatus;


		// Check that the file was encrypted before being written to disk
		$this->assertNotEquals($this->dataLong . $this->dataLong, $retreivedCryptedFile);

		$decrypted = file_get_contents('crypt:///' . $this->userId . '/files/'. $filename);

		$this->assertEquals($this->dataLong . $this->dataLong, $decrypted);

		// Teardown

		$this->view->unlink($this->userId . '/files/' . $filename);

		Encryption\Keymanager::deleteFileKey($this->view, $filename);

	}

	/**
	 * @medium
	 * Test that data that is written by the crypto stream wrapper with AES 128
	 * @note Encrypted data is manually prepared and decrypted here to avoid dependency on success of stream_read
	 * @note If this test fails with truncate content, check that enough array slices are being rejoined to form $e, as the crypt.php file may have gotten longer and broken the manual
	 * reassembly of its data
	 */
	function testStreamDecryptLongFileContentWithoutHeader() {

		// Generate a a random filename
		$filename = 'tmp-' . uniqid() . '.test';

		\OCP\Config::setSystemValue('cipher', 'AES-128-CFB');

		// Save long data as encrypted file using stream wrapper
		$cryptedFile = file_put_contents('crypt:///' . $this->userId . '/files/' . $filename, $this->dataLong . $this->dataLong);

		\OCP\Config::deleteSystemValue('cipher');

		// Test that data was successfully written
		$this->assertTrue(is_int($cryptedFile));

		// Disable encryption proxy to prevent recursive calls
		$proxyStatus = \OC_FileProxy::$enabled;
		\OC_FileProxy::$enabled = false;

		// Get file contents without using any wrapper to get it's actual contents on disk
		$retreivedCryptedFile = $this->view->file_get_contents($this->userId . '/files/' . $filename);

		// Check that the file was encrypted before being written to disk
		$this->assertNotEquals($this->dataLong . $this->dataLong, $retreivedCryptedFile);

		// remove the header to check if we can also decrypt old files without a header,
		//  this files should fall back to AES-128
		$cryptedWithoutHeader = substr($retreivedCryptedFile, Encryption\Crypt::BLOCKSIZE);
		$this->view->file_put_contents($this->userId . '/files/' . $filename, $cryptedWithoutHeader);

		// Re-enable proxy - our work is done
		\OC_FileProxy::$enabled = $proxyStatus;

		$decrypted = file_get_contents('crypt:///' . $this->userId . '/files/'. $filename);

		$this->assertEquals($this->dataLong . $this->dataLong, $decrypted);

		// Teardown

		$this->view->unlink($this->userId . '/files/' . $filename);

		Encryption\Keymanager::deleteFileKey($this->view, $filename);

	}

	/**
	 * @medium
	 */
	function testIsEncryptedContent() {

		$this->assertFalse(Encryption\Crypt::isCatfileContent($this->dataUrl));

		$this->assertFalse(Encryption\Crypt::isCatfileContent($this->legacyEncryptedData));

		$keyfileContent = Encryption\Crypt::symmetricEncryptFileContent($this->dataUrl, 'hat', 'AES-128-CFB');

		$this->assertTrue(Encryption\Crypt::isCatfileContent($keyfileContent));

	}

	/**
	 * @large
	 */
	function testMultiKeyEncrypt() {

		# TODO: search in keyfile for actual content as IV will ensure this test always passes

		$pair1 = Encryption\Crypt::createKeypair();

		$this->assertEquals(2, count($pair1));

		$this->assertTrue(strlen($pair1['publicKey']) > 1);

		$this->assertTrue(strlen($pair1['privateKey']) > 1);


		$crypted = Encryption\Crypt::multiKeyEncrypt($this->dataShort, array($pair1['publicKey']));

		$this->assertNotEquals($this->dataShort, $crypted['data']);


		$decrypt = Encryption\Crypt::multiKeyDecrypt($crypted['data'], $crypted['keys'][0], $pair1['privateKey']);

		$this->assertEquals($this->dataShort, $decrypt);

	}

	/**
	 * @medium
	 */
	function testRenameFile() {

		$filename = 'tmp-' . uniqid();

		// Save long data as encrypted file using stream wrapper
		$cryptedFile = file_put_contents('crypt:///' . $this->userId . '/files/' . $filename, $this->dataLong);

		// Test that data was successfully written
		$this->assertTrue(is_int($cryptedFile));

		// Get file decrypted contents
		$decrypt = file_get_contents('crypt:///' . $this->userId . '/files/' . $filename);

		$this->assertEquals($this->dataLong, $decrypt);

		$newFilename = 'tmp-new-' . uniqid();
		$view = new \OC\Files\View('/' . $this->userId . '/files');
		$view->rename($filename, $newFilename);

		// Get file decrypted contents
		$newDecrypt = file_get_contents('crypt:///'. $this->userId . '/files/' . $newFilename);

		$this->assertEquals($this->dataLong, $newDecrypt);

		// tear down
		$view->unlink($newFilename);
	}

	/**
	 * @medium
	 */
	function testMoveFileIntoFolder() {

		$filename = 'tmp-' . uniqid();

		// Save long data as encrypted file using stream wrapper
		$cryptedFile = file_put_contents('crypt:///' . $this->userId . '/files/' . $filename, $this->dataLong);

		// Test that data was successfully written
		$this->assertTrue(is_int($cryptedFile));

		// Get file decrypted contents
		$decrypt = file_get_contents('crypt:///' . $this->userId . '/files/' . $filename);

		$this->assertEquals($this->dataLong, $decrypt);

		$newFolder = '/newfolder' . uniqid();
		$newFilename = 'tmp-new-' . uniqid();
		$view = new \OC\Files\View('/' . $this->userId . '/files');
		$view->mkdir($newFolder);
		$view->rename($filename, $newFolder . '/' . $newFilename);

		// Get file decrypted contents
		$newDecrypt = file_get_contents('crypt:///' . $this->userId . '/files/' . $newFolder . '/' . $newFilename);

		$this->assertEquals($this->dataLong, $newDecrypt);

		// tear down
		$view->unlink($newFolder);
	}

	/**
	 * @medium
	 */
	function testMoveFolder() {

		$view = new \OC\Files\View('/' . $this->userId . '/files');

		$filename = '/tmp-' . uniqid();
		$folder = '/folder' . uniqid();

		$view->mkdir($folder);

		// Save long data as encrypted file using stream wrapper
		$cryptedFile = file_put_contents('crypt:///' . $this->userId . '/files/' . $folder . $filename, $this->dataLong);

		// Test that data was successfully written
		$this->assertTrue(is_int($cryptedFile));

		// Get file decrypted contents
		$decrypt = file_get_contents('crypt:///' . $this->userId . '/files/' . $folder . $filename);

		$this->assertEquals($this->dataLong, $decrypt);

		$newFolder = '/newfolder/subfolder' . uniqid();
		$view->mkdir('/newfolder');

		$view->rename($folder, $newFolder);

		// Get file decrypted contents
		$newDecrypt = file_get_contents('crypt:///' . $this->userId . '/files/' . $newFolder . $filename);

		$this->assertEquals($this->dataLong, $newDecrypt);

		// tear down
		$view->unlink($newFolder);
		$view->unlink('/newfolder');
	}

	/**
	 * @medium
	 */
	function testChangePassphrase() {
		$filename = 'tmp-' . uniqid();

		// Save long data as encrypted file using stream wrapper
		$cryptedFile = file_put_contents('crypt:///' . $this->userId . '/files/' . $filename, $this->dataLong);

		// Test that data was successfully written
		$this->assertTrue(is_int($cryptedFile));

		// Get file decrypted contents
		$decrypt = file_get_contents('crypt:///' . $this->userId . '/files/' . $filename);

		$this->assertEquals($this->dataLong, $decrypt);

		// change password
		\OC_User::setPassword($this->userId, 'test', null);

		// relogin
		$params['uid'] = $this->userId;
		$params['password'] = 'test';
		OCA\Encryption\Hooks::login($params);

		// Get file decrypted contents
		$newDecrypt = file_get_contents('crypt:///' . $this->userId . '/files/' . $filename);

		$this->assertEquals($this->dataLong, $newDecrypt);

		// tear down
		// change password back
		\OC_User::setPassword($this->userId, $this->pass);
		$view = new \OC\Files\View('/' . $this->userId . '/files');
		$view->unlink($filename);
	}

	/**
	 * @medium
	 */
	function testViewFilePutAndGetContents() {

		$filename = '/tmp-' . uniqid();
		$view = new \OC\Files\View('/' . $this->userId . '/files');

		// Save short data as encrypted file using stream wrapper
		$cryptedFile = $view->file_put_contents($filename, $this->dataShort);

		// Test that data was successfully written
		$this->assertTrue(is_int($cryptedFile));

		// Get file decrypted contents
		$decrypt = $view->file_get_contents($filename);

		$this->assertEquals($this->dataShort, $decrypt);

		// Save long data as encrypted file using stream wrapper
		$cryptedFileLong = $view->file_put_contents($filename, $this->dataLong);

		// Test that data was successfully written
		$this->assertTrue(is_int($cryptedFileLong));

		// Get file decrypted contents
		$decryptLong = $view->file_get_contents($filename);

		$this->assertEquals($this->dataLong, $decryptLong);

		// tear down
		$view->unlink($filename);
	}

	/**
	 * @large
	 */
	function testTouchExistingFile() {
		$filename = '/tmp-' . uniqid();
		$view = new \OC\Files\View('/' . $this->userId . '/files');

		// Save short data as encrypted file using stream wrapper
		$cryptedFile = $view->file_put_contents($filename, $this->dataShort);

		// Test that data was successfully written
		$this->assertTrue(is_int($cryptedFile));

		$view->touch($filename);

		// Get file decrypted contents
		$decrypt = $view->file_get_contents($filename);

		$this->assertEquals($this->dataShort, $decrypt);

		// tear down
		$view->unlink($filename);
	}

	/**
	 * @medium
	 */
	function testTouchFile() {
		$filename = '/tmp-' . uniqid();
		$view = new \OC\Files\View('/' . $this->userId . '/files');

		$view->touch($filename);

		// Save short data as encrypted file using stream wrapper
		$cryptedFile = $view->file_put_contents($filename, $this->dataShort);

		// Test that data was successfully written
		$this->assertTrue(is_int($cryptedFile));

		// Get file decrypted contents
		$decrypt = $view->file_get_contents($filename);

		$this->assertEquals($this->dataShort, $decrypt);

		// tear down
		$view->unlink($filename);
	}

	/**
	 * @medium
	 */
	function testFopenFile() {
		$filename = '/tmp-' . uniqid();
		$view = new \OC\Files\View('/' . $this->userId . '/files');

		// Save short data as encrypted file using stream wrapper
		$cryptedFile = $view->file_put_contents($filename, $this->dataShort);

		// Test that data was successfully written
		$this->assertTrue(is_int($cryptedFile));

		$handle = $view->fopen($filename, 'r');

		// Get file decrypted contents
		$decrypt = fgets($handle);

		$this->assertEquals($this->dataShort, $decrypt);

		// tear down
		$view->unlink($filename);
	}

}
