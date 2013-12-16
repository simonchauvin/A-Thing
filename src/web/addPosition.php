<?php 
    //Retrieve the data
    $x = $_POST['x'];
    $y = $_POST['y'];
    $wall1X = $_POST['wall1x'];
    $wall1Y = $_POST['wall1y'];
    $wall1Inclined = $_POST['wall1inclined'];
    $wall2X = $_POST['wall2x'];
    $wall2Y = $_POST['wall2y'];
    $wall2Inclined = $_POST['wall2inclined'];
    //Write to the JSON file
    $inp = file_get_contents('../persistentData.json');
    $tempArray = json_decode($inp, true);
    $arrne['x'] = $x;
    $arrne['y'] = $y;
    array_push($tempArray['positions'], $arrne);
    if ($wall1X) {
        $arrne['x'] = $wall1X;
        $arrne['y'] = $wall1Y;
        $arrne['inclined'] = $wall1Inclined;
        array_push($tempArray['walls'], $arrne);
    }
    if ($wall2X) {
        $arrne['x'] = $wall2X;
        $arrne['y'] = $wall2Y;
        $arrne['inclined'] = $wall2Inclined;
        array_push($tempArray['walls'], $arrne);
    }
    $jsonData = json_encode($tempArray);
    file_put_contents('../persistentData.json', $jsonData);
?>