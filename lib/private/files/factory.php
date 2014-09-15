<?php
/**
 * Copyright (c) 2014 Robin Appelman <icewind@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

namespace OC\Files;

use OC\Files\Mount\Manager;
use OC\Files\Node\Root;
use OC\Files\Storage\Loader;
use OC\Files\Storage\Wrapper\Quota;
use OCP\Files\FileInfo;

class Factory {
	/**
	 * @var \OCP\IConfig
	 */
	protected $config;

	/**
	 * @param \OCP\IConfig $config
	 */
	public function __construct($config) {
		$this->config = $config;
	}

	/**
	 * @param \OC\Files\Mount\Manager $mountManager
	 * @param \OC\Files\Storage\Loader $storageLoader
	 */
	protected function mountRoot($mountManager, $storageLoader) {
		// mount local file backend as root
		$configDataDirectory = $this->config->getSystemValue("datadirectory", \OC::$SERVERROOT . "/data");
		//first set up the local "root" storage
		$mount = new Mount\Mount('\OC\Files\Storage\Local', '/', array('datadir' => $configDataDirectory), $storageLoader);
		$mountManager->addMount($mount);
	}

	/**
	 * @param \OC\Files\Mount\Manager $mountManager
	 * @param \OC\Files\Storage\Loader $storageLoader
	 * @param \OCP\IUser $user
	 */
	protected function mountUserFolder($mountManager, $storageLoader, $user) {
		// check for legacy home id (<= 5.0.12)
		$legacy = \OC\Files\Cache\Storage::exists('local::' . $user->getHome() . '/');
		$mount = new Mount\Mount('\OC\Files\Storage\Home', '/' . $user->getUID(), array(
			'datadir' => $user->getHome(),
			'user' => $user,
			'legacy' => $legacy
		), $storageLoader);
		$mountManager->addMount($mount);
	}

	/**
	 * @param \OC\Files\Mount\Manager $mountManager
	 * @param \OC\Files\Storage\Loader $storageLoader
	 * @param \OCP\IUser $user
	 */
	protected function mountCacheDir($mountManager, $storageLoader, $user) {
		$cacheBaseDir = $this->config->getSystemValue('cache_path', '');
		if ($cacheBaseDir === '') {
			// use local cache dir relative to the user's home
			$mount = $mountManager->find('/' . $user->getUID());
			$userStorage = $mount->getStorage();
			if (!$userStorage->file_exists('cache')) {
				$userStorage->mkdir('cache');
			}
		} else {
			$cacheDir = rtrim($cacheBaseDir, '/') . '/' . $user->getUID();
			if (!file_exists($cacheDir)) {
				mkdir($cacheDir, 0770, true);
			}
			$mount = new Mount\Mount('\OC\Files\Storage\Local', '/' . $user->getUID() . '/cache', array('datadir' => $cacheDir), $storageLoader);
			$mountManager->addMount($mount);
		}
	}

	/**
	 * @param \OCP\IUser $user
	 */
	protected function copySkeleton($user) {
		$userDirectory = $user->getHome() . '/files';
		if (!is_dir($userDirectory)) {
			mkdir($userDirectory, 0755, true);
			$skeletonDirectory = $this->config->getSystemValue('skeletondirectory', \OC::$SERVERROOT . '/core/skeleton');
			if (!empty($skeletonDirectory)) {
				\OC_Util::copyr($skeletonDirectory, $userDirectory);
			}
		}
	}

	/**
	 * Create the root filesystem
	 *
	 * @return \OC\Files\Node\Root
	 */
	public function createRoot() {
		$mountManager = new Manager();
		$storageLoader = new Loader();

		$storageLoader->addStorageWrapper('oc_quota', function ($mountPoint, $storage) {
			/**
			 * @var \OC\Files\Storage\Storage $storage
			 */
			if ($storage->instanceOfStorage('\OCP\Files\IHomeStorage')) {
				/**
				 * @var \OCP\Files\IHomeStorage $storage
				 */
				if (is_object($storage->getUser())) {
					$user = $storage->getUser()->getUID();
					$quota = \OC_Util::getUserQuota($user);
					if ($quota !== FileInfo::SPACE_UNLIMITED) {
						return new Quota(array('storage' => $storage, 'quota' => $quota, 'root' => 'files'));
					}
				}
			}
			return $storage;
		});

		$this->mountRoot($mountManager, $storageLoader);
		return new Root($mountManager, $storageLoader, new View(''));
	}

	/**
	 * Mount the storages for a user
	 *
	 * @param \OC\Files\Node\Root $root
	 * @param \OCP\IUser $user
	 */
	public function setupForUser($root, $user) {
		$mountManager = $root->getMountManager();
		$storageLoader = $root->getStorageLoader();
		if (is_null($mountManager->getMount('/' . $user->getUID()))) {
			$this->mountUserFolder($mountManager, $storageLoader, $user);
			$this->mountCacheDir($mountManager, $storageLoader, $user);
			\OC_Hook::emit('OC_Filesystem', 'post_initMountPoints', array('user' => $user, 'user_dir' => $user->getHome()));

			$this->copySkeleton($user);

			\OC_Hook::emit('OC_Filesystem', 'setup', array('user' => $user->getUID(), 'user_dir' => $user->getHome() . '/files'));
		}
	}
}
