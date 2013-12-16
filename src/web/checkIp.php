<?php 
    $clientIp = $_SERVER['REMOTE_ADDR'];
    $knownIp = "false";
    $array = explode(",", file_get_contents('../ipAddresses.txt'));
    for ($i = 0; $i < count($array); $i++) {
        if ($array[$i] == $clientIp) {
            $knownIp = "true";
        }
    }
    if ($knownIp == "false") {
        $newIp = $clientIp;
        file_put_contents('../ipAddresses.txt', $newIp, FILE_APPEND | LOCK_EX);
        file_put_contents('../ipAddresses.txt', ',', FILE_APPEND | LOCK_EX);
    }
    echo $knownIp;
?>