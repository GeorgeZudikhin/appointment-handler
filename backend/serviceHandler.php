<?php    

// Handling HTTP requests and responding for the Appointment Finder web application

include("businesslogic/simpleLogic.php");

$method = "";
$param = "";

if($_SERVER["REQUEST_METHOD"] == "GET"){
    isset($_GET["method"]) ? $method = $_GET["method"] : false;
    isset($_GET["param"]) ? $param = $_GET["param"] : false;
}
if($_SERVER["REQUEST_METHOD"] == "POST"){
    isset($_POST["method"]) ? $method = $_POST["method"] : false;
    isset($_POST["param"]) ? $param = $_POST["param"] : false;
}

$logic = new SimpleLogic();
$result = $logic->handleRequest($method, $param);
if ($result == null) {
    response("GET", 400, null);
} 
else {
    if($_SERVER["REQUEST_METHOD"] == "GET"){
        response("GET", 200, $result);
    }
    if($_SERVER["REQUEST_METHOD"] == "POST"){
        response("POST", 200, $result);
    }
}

function response($method, $httpStatus, $data)  // is used to format the HTTP response in JSON format and set the appropriate headers and status codes
{
    header('Content-Type: application/json');
    switch ($method) {
        case "GET":
            http_response_code($httpStatus);
            echo (json_encode($data));
            break;
        case "POST":
            http_response_code($httpStatus);
            echo (json_encode($data));
            break;
        default:
            http_response_code(405);
            echo ("Method not supported!");
    }
}
