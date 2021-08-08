<?php


if (file_exists("log.txt")) {
    $file = "log.txt";
    $current = file_get_contents($file);
} else {
    $myfile = fopen("log.txt","w");
    header("Refresh:0");
}





?>

<form action="/save/almacenamiento.php" method="post">
<textarea name="comment" id="" cols="30" rows="10">

<?php

echo $current

?>


</textarea>



<input type="submit">
</form>

