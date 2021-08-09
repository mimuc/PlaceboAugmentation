<?php 

$comment = $_POST;

$pages = json_decode($comment["data"], true);
$userID = json_decode($pages[0]["responses"]);

$file = $comment["userID"]."_".$comment["condition"].".json";

if (file_exists($file)) {
    $myfile = $comment["userID"]."_".$comment["condition"]."_Repeated_".uniqid().".json";
} else {
    $myfile = $file;
}

file_put_contents($myfile, $comment["data"]);

?>