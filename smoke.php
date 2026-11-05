<?php
$required=['index.php','checkout.php','admin/index.php','database/schema.sql','app/Store.php','installation/index.php'];
foreach($required as $f){if(!is_file(dirname(__DIR__).'/'.$f)){fwrite(STDERR,"Missing $f\n");exit(1);}}
echo "Project file smoke test passed\n";
