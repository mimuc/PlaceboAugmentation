<?php

function debug_to_console($data) {
    $output = $data;
    if (is_array($output))
        $output = implode(',', $output);

    echo "<script>console.log('Debug Objects: " . $output . "' );</script>";
}

if (file_exists("log.txt")) {
    $file = "log.txt";
    $current = file_get_contents($file);
} else {
    $myfile = fopen("log.txt","w");
    header("Refresh:0");
}

$comment = $_POST;

$file = "log.txt";

file_put_contents($file, $comment);

debug_to_console($comment);
header("/save/storedata.php")

?>