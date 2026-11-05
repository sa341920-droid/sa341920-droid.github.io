<?php
declare(strict_types=1);
define('ROOT', dirname(__DIR__));
$configFile = ROOT.'/config/config.php';
if (!is_file($configFile)) {
 http_response_code(503);
 exit('Setup required: copy config/config.sample.php to config/config.php and configure database.');
}
$GLOBALS['config'] = require $configFile;
date_default_timezone_set($GLOBALS['config']['timezone'] ?? 'Asia/Karachi');
if (session_status() !== PHP_SESSION_ACTIVE) {
 session_name($GLOBALS['config']['session_name'] ?? 'royal_store');
 $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
 session_set_cookie_params(['httponly'=>true,'secure'=>$secure,'samesite'=>'Lax','path'=>'/']);
 session_start();
}
require_once ROOT.'/app/Database.php';
require_once ROOT.'/app/helpers.php';
require_once ROOT.'/app/Security.php';
require_once ROOT.'/app/Auth.php';
require_once ROOT.'/app/Store.php';
require_once ROOT.'/app/Admin.php';
