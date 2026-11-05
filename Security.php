<?php
final class Security {
 public static function csrf(): string {
  if (empty($_SESSION['_csrf'])) $_SESSION['_csrf']=bin2hex(random_bytes(32));
  return $_SESSION['_csrf'];
 }
 public static function field(): string { return '<input type="hidden" name="_csrf" value="'.e(self::csrf()).'">'; }
 public static function verify(): void {
  $sent=$_POST['_csrf'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
  if (!is_string($sent) || !hash_equals(self::csrf(),$sent)) {
   http_response_code(419); exit('Security token expired. Refresh and try again.');
  }
 }
 public static function upload(array $f, array $allowed=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp']): string {
  if (($f['error'] ?? UPLOAD_ERR_NO_FILE)!==UPLOAD_ERR_OK) throw new RuntimeException('Upload failed');
  $max=(int)($GLOBALS['config']['upload_max_mb'] ?? 5)*1024*1024;
  if ($f['size']>$max) throw new RuntimeException('File too large');
  $mime=(new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
  if (!isset($allowed[$mime])) throw new RuntimeException('Unsupported file type');
  $name=bin2hex(random_bytes(16)).'.'.$allowed[$mime];
  $dir=ROOT.'/uploads/'.date('Y/m');
  if (!is_dir($dir)) mkdir($dir,0755,true);
  if (!move_uploaded_file($f['tmp_name'],$dir.'/'.$name)) throw new RuntimeException('Cannot save upload');
  return 'uploads/'.date('Y/m').'/'.$name;
 }
}
