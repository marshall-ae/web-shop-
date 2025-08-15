<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "inkfusion";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

function saveBase64Image($base64, $prefix = 'img_') {
    if (preg_match('/^data:image\/(\w+);base64,/', $base64, $type)) {
        $data = substr($base64, strpos($base64, ',') + 1);
        $data = base64_decode($data);
        $ext = strtolower($type[1]);

        $filename = $prefix . time() . '_' . rand(1000,9999) . '.' . $ext;
        $filepath = 'uploads/' . $filename;

        if (file_put_contents($filepath, $data)) {
            return $filepath;
        }
    }
    return null;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $address = $_POST['address'] ?? '';
    $delivery = $_POST['delivery'] ?? '';
    $note = $_POST['note'] ?? '';
    $items = $_POST['items'] ?? '';
    $total = $_POST['total'] ?? '';

    $print_base64 = $_POST['print_image'] ?? '';
    $preview_base64 = $_POST['preview_image'] ?? '';

    $print_path = saveBase64Image($print_base64, 'print_');
    $preview_path = saveBase64Image($preview_base64, 'preview_');

    // Ensure items are properly formatted as JSON
    $items_json = is_array($items) ? json_encode($items) : $items;

    $stmt = $conn->prepare("INSERT INTO orders 
        (name, email, phone, address, delivery, note, items, total, print_image, preview_image) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
    $stmt->bind_param("ssssssssss", 
        $name, $email, $phone, $address, $delivery, $note, $items_json, $total, $print_path, $preview_path
    );

    if ($stmt->execute()) {
        echo "OK";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
}

$conn->close();
?>
