<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/config.php';
if (session_status() !== PHP_SESSION_ACTIVE) {
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>$secure,'httponly'=>true,'samesite'=>'Lax']);
    session_start();
}
if (is_file(dirname(__DIR__).'/installed.lock')) {
    require_once __DIR__.'/db.php';
}
require_once __DIR__.'/helpers.php';
if (!isset($_SESSION['_csrf'])) $_SESSION['_csrf'] = bin2hex(random_bytes(32));
