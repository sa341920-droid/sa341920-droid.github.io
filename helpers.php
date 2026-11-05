<?php
declare(strict_types=1);
function e(mixed $v): string { return htmlspecialchars((string)$v, ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8'); }
function url(string $path=''): string { $base = APP_URL ?: ''; return $base.'/'.ltrim($path,'/'); }
function go(string $path): never { header('Location: '.url($path)); exit; }
function csrf_field(): string { return '<input type="hidden" name="_csrf" value="'.e($_SESSION['_csrf'] ?? '').'">'; }
function verify_csrf(): void {
    $sent = $_POST['_csrf'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($sent) || !hash_equals($_SESSION['_csrf'] ?? '', $sent)) { http_response_code(419); exit('Security token expired. Please go back and retry.'); }
}
function flash(string $type,string $message): void { $_SESSION['_flash'][]=['type'=>$type,'message'=>$message]; }
function flashes(): string {
    $items=$_SESSION['_flash']??[]; unset($_SESSION['_flash']); $out='';
    foreach($items as $f) $out.='<div class="notice '.e($f['type']).'">'.e($f['message']).'</div>';
    return $out;
}
function setting(string $key,string $default=''): string {
    static $cache=[]; if(isset($cache[$key])) return $cache[$key];
    try { $s=db()->prepare('SELECT setting_value FROM settings WHERE setting_key=?'); $s->execute([$key]); $v=$s->fetchColumn(); return $cache[$key]=($v===false?$default:(string)$v); }
    catch(Throwable $e){ return $default; }
}
function money(float|int|string $amount): string { return 'Rs. '.number_format((float)$amount,2); }
function current_user(): ?array { return $_SESSION['user']??null; }
function require_login(): void { if(!current_user()) { flash('error','Please sign in first.'); go('index.php?page=login'); } }
function require_admin(): void { require_login(); if(($_SESSION['user']['role']??'')!=='admin') { http_response_code(403); exit('Access denied'); } }
function cart_items(): array { return $_SESSION['cart']??[]; }
function cart_count(): int { return array_sum(array_map(fn($x)=>(int)$x['qty'],cart_items())); }
function slugify(string $s): string { $s=strtolower(trim($s)); $s=preg_replace('/[^a-z0-9]+/','-',$s)??''; return trim($s,'-') ?: bin2hex(random_bytes(4)); }
function site_title(string $title=''): string { return e($title ? $title.' | '.APP_NAME : APP_NAME); }
