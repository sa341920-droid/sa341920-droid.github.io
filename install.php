<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/config.php';
session_start();
$error='';
if(is_file(dirname(__DIR__).'/installed.lock')) die('Already installed. Remove installed.lock only if you intentionally want to reinstall.');
if($_SERVER['REQUEST_METHOD']==='POST'){
 try{
  $host=trim($_POST['db_host']??'localhost');$name=trim($_POST['db_name']??'');$user=trim($_POST['db_user']??'');$pass=$_POST['db_pass']??'';
  $pdo=new PDO("mysql:host=$host;charset=utf8mb4",$user,$pass,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
  $pdo->exec("CREATE DATABASE IF NOT EXISTS `".str_replace('`','',$name)."` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
  $pdo->exec("USE `".str_replace('`','',$name)."`");
  $sql=file_get_contents(dirname(__DIR__).'/database.sql');$pdo->exec($sql);
  $admin=trim($_POST['admin_name']??'');$email=strtolower(trim($_POST['admin_email']??''));$pw=$_POST['admin_password']??'';
  if(strlen($admin)<2||!filter_var($email,FILTER_VALIDATE_EMAIL)||strlen($pw)<12)throw new RuntimeException('Admin name/email invalid or password shorter than 12 characters.');
  $st=$pdo->prepare("INSERT INTO users(name,email,password_hash,role,is_active,created_at) VALUES(?,?,?,'admin',1,NOW())");$st->execute([$admin,$email,password_hash($pw,PASSWORD_DEFAULT)]);
  $cfg="<?php\ndefine('DB_HOST',".var_export($host,true).");\ndefine('DB_NAME',".var_export($name,true).");\ndefine('DB_USER',".var_export($user,true).");\ndefine('DB_PASS',".var_export($pass,true).");\ndefine('APP_SECRET',".var_export(bin2hex(random_bytes(32)),true).");\n";
  if(file_put_contents(dirname(__DIR__).'/config.local.php',$cfg,LOCK_EX)===false)throw new RuntimeException('Cannot write config.local.php. Set file permissions or create it manually.');
  file_put_contents(dirname(__DIR__).'/installed.lock','installed '.date(DATE_ATOM));
  header('Location: ../admin/');exit;
 }catch(Throwable $e){$error=$e->getMessage();}
}
?><!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Royal Store Installer</title><link rel="stylesheet" href="../assets/css/style.css"></head><body><main class="container"><h1>Royal Store Installation Wizard</h1><p>Enter your MySQL database and first owner account details.</p><?php if($error):?><div class="notice error"><?=htmlspecialchars($error,ENT_QUOTES,'UTF-8')?></div><?php endif;?><form method="post" class="form-card"><h2>Database</h2><label>Database host<input name="db_host" value="localhost" required></label><label>Database name<input name="db_name" required></label><label>Database username<input name="db_user" required></label><label>Database password<input type="password" name="db_pass"></label><h2>Owner account</h2><label>Owner name<input name="admin_name" required></label><label>Owner email<input type="email" name="admin_email" required></label><label>Strong password (12+ characters)<input type="password" name="admin_password" minlength="12" required></label><button class="btn">Install Store</button></form></main></body></html>
