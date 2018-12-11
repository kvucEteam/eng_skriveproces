<?php
// This PHP solution for converting HTML into WORD format was found here:
// http://stackoverflow.com/questions/1624485/how-to-convert-html-file-to-word
// See also here:
// https://stackoverflow.com/questions/40628171/how-to-convert-html-to-word-using-php
//
?>
<?php 
	header("Content-Type: application/vnd.ms-word; charset=utf-8"); 
	header("Expires: 0"); 
	header("Cache-Control: must-revalidate, post-check=0, pre-check=0"); 
	if ((isset($_POST['html'])) && ($_POST['html'] !== "") && (isset($_POST['fileName'])) && ($_POST['fileName'] !== "")){
		header("content-disposition: attachment;filename=".$_POST["fileName"].".doc"); 
		print $_POST['html'];
	}
?>