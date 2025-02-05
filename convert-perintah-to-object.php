
<?php
$file = "perintah.txt";
$lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

$data = [];
for ($i = 0; $i < count($lines); $i += 2) {
    $data[] = [
        "vk" => $lines[$i + 1], // Key dari baris genap
        "t" => $lines[$i]        // Kalimat dari baris ganjil
    ];
}

// Tampilkan dalam format JSON

$outputFile = "perintah.json";
file_put_contents($outputFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo "Konversi selesai! Cek file '$outputFile'.\n";
?>
