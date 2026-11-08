<?php
// Run from CLI only after importing database/schema.sql and configuring backend/config.php:
// php create_owner.php "Owner Name" "owner@example.com" "A-Long-Unique-Password"
if(PHP_SAPI!=='cli'){http_response_code(404);exit;}
if($argc!==4){fwrite(STDERR,"Usage: php create_owner.php \"Owner Name\" \"email\" \"password\"\n");exit(1);}
$cfg=require __DIR__.'/config.php';$pdo=new PDO('mysql:host='.$cfg['db_host'].';dbname='.$cfg['db_name'].';charset=utf8mb4',$cfg['db_user'],$cfg['db_pass'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);$s=$pdo->prepare("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,'owner')");$s->execute([$argv[1],strtolower($argv[2]),password_hash($argv[3],PASSWORD_DEFAULT)]);echo "Owner created. Sign in at frontend/owner.html\n";
