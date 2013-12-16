<?php 
    $clientIp = $_SERVER['REMOTE_ADDR'];
    $knownIp = "false";
    $array = explode(",", file_get_contents('../ipAddresses.txt'));
    for ($i = 0; $i < count($array); $i++) {
        if ($array[$i] == $clientIp) {
            $knownIp = "true";
        }
    }
    echo $knownIp;
?>