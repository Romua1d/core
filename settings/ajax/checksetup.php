<?php
/**
 * Copyright (c) 2014, Vincent Petry <pvince81@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

OC_JSON::checkAdminUser();

$hasInternet = false;
if (OC_Util::isInternetConnectionEnabled()) {
	$hasInternet = OC_Util::isInternetConnectionWorking();
}

OC_JSON::success(
	array(
		'serverhasinternetconnection' => $hasInternet
	)
);
