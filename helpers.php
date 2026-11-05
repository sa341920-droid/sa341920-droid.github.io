<?php
function db(): PDO { return Database::conn(); }
function e(mixed $v): string { return htmlspecialchars((string)$v, ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8'); }
function money(float|int|string $v): string { return 'Rs '.number_format((float)$v, 2); }
function redirect(string $to): never { header('Location: '.$to); exit; }
function setting(string $key, string $default=''): string {
 static $cache=[]; if (isset($cache[$key])) return $cache[$key];
 try { $q=db()->prepare('SELECT setting_value FROM settings WHERE setting_key=?'); $q->execute([$key]); return $cache[$key]=(string)($q->fetchColumn() ?: $default); } catch(Throwable) { return $default; }
}
function slugify(string $s): string {
 $s = strtolower(trim($s)); $s = preg_replace('/[^a-z0-9]+/','-',$s); return trim($s,'-') ?: 'item';
}
function json_response(array $data, int $status=200): never {
 http_response_code($status); header('Content-Type: application/json; charset=utf-8'); echo json_encode($data); exit;
}
function current_lang(): string { return ($_SESSION['lang'] ?? 'en') === 'ur' ? 'ur' : 'en'; }
function t(string $en, string $ur): string { return current_lang()==='ur' ? $ur : $en; }
function audit(string $action, string $entity='', ?int $entityId=null): void {
 if (empty($_SESSION['user']['id'])) return;
 $q=db()->prepare('INSERT INTO audit_logs(user_id,action,entity,entity_id,ip_address) VALUES(?,?,?,?,?)');
 $q->execute([$_SESSION['user']['id'],$action,$entity,$entityId,$_SERVER['REMOTE_ADDR'] ?? null]);
}
