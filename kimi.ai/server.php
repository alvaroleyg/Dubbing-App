<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $audioData = file_get_contents('php://input');
    $filePath = 'recordings/recording_' . time() . '.wav';
    file_put_contents($filePath, $audioData);
    echo $filePath;
}
?>