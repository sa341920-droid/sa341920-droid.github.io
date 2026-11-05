<?php
// Keep credentials outside Git. Copy to integrations.local.php and fill from providers.
return [
 'jazzcash' => ['enabled'=>false,'merchant_id'=>'','password'=>'','integrity_salt'=>'','sandbox'=>true],
 'easypaisa' => ['enabled'=>false,'store_id'=>'','hash_key'=>'','sandbox'=>true],
 'courier' => ['provider'=>'manual','api_url'=>'','api_key'=>''],
 'smtp' => ['host'=>'','port'=>587,'user'=>'','pass'=>'','from'=>''],
 'whatsapp' => ['enabled'=>false,'token'=>'','phone_number_id'=>''],
 'sms' => ['provider'=>'','api_key'=>''],
];
