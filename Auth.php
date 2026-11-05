<?php
final class Auth {
 public static function user(): ?array { return $_SESSION['user'] ?? null; }
 public static function requireLogin(): void { if (!self::user()) redirect('/auth/login.php'); }
 public static function requireAdmin(): void {
  self::requireLogin();
  if (!in_array(self::user()['role'],['admin','manager'],true)) { http_response_code(403); exit('Forbidden'); }
 }
 public static function login(string $email,string $password): bool {
  $q=db()->prepare('SELECT id,name,email,password_hash,role,status FROM users WHERE email=? LIMIT 1');
  $q->execute([strtolower(trim($email))]); $u=$q->fetch();
  if (!$u || $u['status']!=='active' || !password_verify($password,$u['password_hash'])) return false;
  session_regenerate_id(true); unset($u['password_hash']); $_SESSION['user']=$u; return true;
 }
 public static function register(string $name,string $email,string $password): int {
  if (strlen($password)<10) throw new InvalidArgumentException('Password must be at least 10 characters');
  $q=db()->prepare("INSERT INTO users(name,email,password_hash,role,status) VALUES(?,?,?,'customer','active')");
  $q->execute([trim($name),strtolower(trim($email)),password_hash($password,PASSWORD_DEFAULT)]);
  return (int)db()->lastInsertId();
 }
 public static function logout(): void { $_SESSION=[]; session_regenerate_id(true); }
}
