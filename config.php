<?php
declare(strict_types=1);
/**
 * Runtime configuration. The installer creates config.local.php.
 * Never commit real database credentials or secrets.
 */
define('APP_ROOT', __DIR__);
define('APP_ENV', getenv('APP_ENV') ?: 'production');
define('APP_URL', rtrim(getenv('APP_URL') ?: '', '/'));
define('APP_NAME', getenv('APP_NAME') ?: 'Royal Mobile And Printing Store');
define('APP_PHONE', getenv('APP_PHONE') ?: '03040011041');
define('APP_LOCATION', getenv('APP_LOCATION') ?: 'Faisalabad Punjab Pakistan');
$localConfig = __DIR__ . '/config.local.php';
if (is_file($localConfig)) require_once $localConfig;
if (!defined('DB_HOST')) define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
if (!defined('DB_NAME')) define('DB_NAME', getenv('DB_NAME') ?: '');
if (!defined('DB_USER')) define('DB_USER', getenv('DB_USER') ?: '');
if (!defined('DB_PASS')) define('DB_PASS', getenv('DB_PASS') ?: '');
if (!defined('DB_CHARSET')) define('DB_CHARSET', 'utf8mb4');
if (!defined('APP_SECRET')) define('APP_SECRET', getenv('APP_SECRET') ?: '');
