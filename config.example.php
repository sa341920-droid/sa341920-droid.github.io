<?php
// Copy to config.php. Keep config.php outside Git and never expose secrets.
return [
 'db_host' => 'localhost',
 'db_name' => 'royal_market_place',
 'db_user' => 'YOUR_DB_USER',
 'db_pass' => 'YOUR_DB_PASSWORD',
 'allowed_origins' => ['https://YOUR-GITHUB-USERNAME.github.io','https://YOUR-CUSTOM-DOMAIN.example'],
 'app_url' => 'https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY/',
 'install_key' => 'CHANGE-TO-A-LONG-RANDOM-SECRET',
 'currency' => 'PKR',
 // Absolute private path outside public_html; create it with owner-only permissions.
 'backup_dir' => '/home/YOUR-ACCOUNT/private/rmp-backups',
 // Optional provider credentials. Keep secrets on PHP hosting only; never put them in GitHub frontend.
 'integrations' => [
   'jazzcash' => ['merchant_id' => getenv('JAZZCASH_MERCHANT_ID') ?: '', 'password' => getenv('JAZZCASH_PASSWORD') ?: '', 'integrity_salt' => getenv('JAZZCASH_INTEGRITY_SALT') ?: ''],
   'easypaisa' => ['store_id' => getenv('EASYPAISA_STORE_ID') ?: '', 'hash_key' => getenv('EASYPAISA_HASH_KEY') ?: ''],
   'smtp' => ['host' => getenv('SMTP_HOST') ?: '', 'user' => getenv('SMTP_USER') ?: '', 'pass' => getenv('SMTP_PASS') ?: ''],
   'meta' => ['app_id' => getenv('META_APP_ID') ?: '', 'app_secret' => getenv('META_APP_SECRET') ?: '', 'access_token' => getenv('META_ACCESS_TOKEN') ?: ''],
   'whatsapp' => ['phone_number_id' => getenv('WA_PHONE_NUMBER_ID') ?: '', 'access_token' => getenv('WA_ACCESS_TOKEN') ?: ''],
   'sms' => ['provider' => getenv('SMS_PROVIDER') ?: '', 'api_key' => getenv('SMS_API_KEY') ?: ''],
 ],
];
