<?php 
    file_put_contents('../ipAddresses.txt', '', FILE_APPEND | LOCK_EX);
	
	$tempArray = array('positions' => array(), 'walls' => array());

	$positions = array('x' => 250, 'y' => 450);
	$walls = array('x' => 452, 'y' => 70, 'inclined' => false);
	
	/*$arrne['x'] = 250;
    $arrne['y'] = 450;*/
    array_push($tempArray['positions'], $positions);
	/*$arrne['x'] = 452;
	$arrne['y'] = 70;
	$arrne['inclined'] = false;*/
	array_push($tempArray['walls'], $walls);
	$jsonData = json_encode($tempArray);
	file_put_contents('../persistentData.json', $jsonData);
?>