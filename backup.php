<?php
declare(strict_types=1);
// Run from CLI only. Configure a private backup directory outside public_html.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$root = dirname(__DIR__);
$cfgFile = $root . '/config.php';
if (!is_file($cfgFile)) { fwrite(STDERR, "Missing config.php\n"); exit(1); }
$cfg = require $cfgFile;
$dir = $cfg['backup_dir'] ?? '';
if (!$dir || !str_starts_with($dir, DIRECTORY_SEPARATOR) || str_contains($dir, $root)) {
    fwrite(STDERR, "Set backup_dir to an absolute private path OUTSIDE the backend/public web root in config.php\n"); exit(1);
}
if (!is_dir($dir) && !mkdir($dir, 0700, true)) { fwrite(STDERR, "Cannot create backup directory\n"); exit(1); }
$stamp = gmdate('Ymd-His');
$file = rtrim($dir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'rmp-' . $stamp . '.sql.gz';
$cmd = ['mysqldump', '--single-transaction', '--quick', '--skip-lock-tables', '--host=' . $cfg['db_host'], '--user=' . $cfg['db_user'], $cfg['db_name']];
$spec = [0=>['pipe','r'],1=>['pipe','w'],2=>['pipe','w']];
$env = ['MYSQL_PWD'=>(string)$cfg['db_pass'], 'PATH'=>(getenv('PATH') ?: '/usr/bin:/bin')];
$proc = proc_open($cmd, $spec, $pipes, $root, $env);
if (!is_resource($proc)) { fwrite(STDERR, "Could not start mysqldump\n"); exit(1); }
fclose($pipes[0]);
$gz = gzopen($file, 'wb9');
while (!feof($pipes[1])) { $chunk = fread($pipes[1], 1024 * 1024); if ($chunk === false) break; if ($chunk !== '') gzwrite($gz, $chunk); }
fclose($pipes[1]);
$err = stream_get_contents($pipes[2]); fclose($pipes[2]);
$code = proc_close($proc); gzclose($gz);
if ($code !== 0 || !is_file($file) || filesize($file) === 0) { @unlink($file); fwrite(STDERR, "Backup failed: " . $err . "\n"); exit(1); }
chmod($file, 0600);
echo "Backup created: {$file}\n";
