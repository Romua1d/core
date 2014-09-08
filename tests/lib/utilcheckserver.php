<?php
/**
 * Copyright (c) 2014 Vincent Petry <pvince81@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

/**
 * Tests for server check functions
 */
class Test_Util_CheckServer extends PHPUnit_Framework_TestCase {

	private $datadir;

	/**
	 * @param array $systemOptions
	 * @return \OCP\IConfig | PHPUnit_Framework_MockObject_MockObject
	 */
	protected function getConfig($systemOptions) {
		$systemOptions['datadirectory'] = $this->datadir;
		$systemOptions['appstoreenabled'] = false; //it's likely that there is no app folder we can write in
		$config = $this->getMockBuilder('\OCP\IConfig')
			->disableOriginalConstructor()
			->getMock();

		$config->expects($this->any())
			->method('getSystemValue')
			->will($this->returnCallback(function ($key, $default) use ($systemOptions) {
				return isset($systemOptions[$key]) ? $systemOptions[$key] : $default;
			}));
		return $config;
	}

	public function setUp() {
		$this->datadir = \OC_Helper::tmpFolder();

		file_put_contents($this->datadir . '/.ocdata', '');
		\OC::$server->getSession()->set('checkServer_succeeded', false);
	}

	public function tearDown() {
		// clean up
		@unlink($this->datadir . '/.ocdata');
	}

	/**
	 * Test that checkServer() returns no errors in the regular case.
	 */
	public function testCheckServer() {
		$result = \OC_Util::checkServer($this->getConfig(array(
			'installed' => true
		)));
		$this->assertEmpty($result);
	}

	/**
	 * Test that checkServer() does not check the data dir validity
	 * when the server is not installed yet (else the setup cannot
	 * be run...)
	 */
	public function testCheckServerSkipDataDirValidityOnSetup() {
		// simulate old version that didn't have it
		unlink($this->datadir . '/.ocdata');

		// even though ".ocdata" is missing, the error isn't
		// triggered to allow setup to run
		$result = \OC_Util::checkServer($this->getConfig(array(
			'installed' => false
		)));
		$this->assertEmpty($result);
	}

	/**
	 * Test that checkServer() does not check the data dir validity
	 * when an upgrade is required (else the upgrade cannot be
	 * performed...)
	 */
	public function testCheckServerSkipDataDirValidityOnUpgrade() {
		// simulate old version that didn't have it
		unlink($this->datadir . '/.ocdata');

		$session = \OC::$server->getSession();
		$oldCurrentVersion = $session->get('OC_Version');

		// upgrade condition to simulate needUpgrade() === true
		$session->set('OC_Version', array(6, 0, 0, 2));

		// even though ".ocdata" is missing, the error isn't
		// triggered to allow for upgrade
		$result = \OC_Util::checkServer($this->getConfig(array(
			'installed' => true,
			'version' => '6.0.0.1'
		)));
		$this->assertEmpty($result);

		// restore versions
		$session->set('OC_Version', $oldCurrentVersion);
	}

	/**
	 * Test that checkDataDirectoryValidity returns no error
	 * when ".ocdata" is present.
	 */
	public function testCheckDataDirValidity() {
		$result = \OC_Util::checkDataDirectoryValidity($this->datadir);
		$this->assertEmpty($result);
	}

	/**
	 * Test that checkDataDirectoryValidity and checkServer
	 * both return an error when ".ocdata" is missing.
	 */
	public function testCheckDataDirValidityWhenFileMissing() {
		unlink($this->datadir . '/.ocdata');
		$result = \OC_Util::checkDataDirectoryValidity($this->datadir);
		$this->assertEquals(1, count($result));

		$result = \OC_Util::checkServer($this->getConfig(array(
			'installed' => true,
			'version' => implode('.', OC_Util::getVersion())
		)));
		$this->assertCount(1, $result);
	}

	/**
	 * Tests that no error is given when the datadir is writable
	 */
	public function testDataDirWritable() {
		$result = \OC_Util::checkServer($this->getConfig(array(
			'installed' => true,
			'version' => implode('.', OC_Util::getVersion())
		)));
		$this->assertEmpty($result);
	}

	/**
	 * Tests an error is given when the datadir is not writable
	 */
	public function testDataDirNotWritable() {
		chmod($this->datadir, 0300);
		$result = \OC_Util::checkServer($this->getConfig(array(
			'installed' => true,
			'version' => implode('.', OC_Util::getVersion())
		)));
		$this->assertCount(1, $result);
	}

	/**
	 * Tests no error is given when the datadir is not writable during setup
	 */
	public function testDataDirNotWritableSetup() {
		chmod($this->datadir, 0300);
		$result = \OC_Util::checkServer($this->getConfig(array(
			'installed' => false,
			'version' => implode('.', OC_Util::getVersion())
		)));
		chmod($this->datadir, 0700); //needed for cleanup
		$this->assertEmpty($result);
	}
}
