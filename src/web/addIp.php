<?php 
    $clientIp = $_SERVER['REMOTE_ADDR'];
    file_put_contents('../ipAddresses.txt', $clientIp, FILE_APPEND | LOCK_EX);
    file_put_contents('../ipAddresses.txt', ',', FILE_APPEND | LOCK_EX);
?>