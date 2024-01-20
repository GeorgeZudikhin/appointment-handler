<?php
include("./models/appointment.php");
include("./models/event.php");
class DataHandler
{
    private $conn; // Variable for connection to the database
    function __construct()
    {
        // Connect to the database with parameters (host, username, password, db name) and store the connection in the variable $conn
        $this->conn = new mysqli("localhost", "bif2webscriptinguser", "bif2023", "appointment_finder");
        if ($this->conn->connect_error) { // Check if there was no error connecting to the database
            echo "Connection Error: " . $this->conn->connect_error; 
            exit(); 
        }
    }
    // Query all events
    public function queryEvents()
    {
        $res = $this->getEventData(); // Calling the function getEventData() and storing the result in the variable $res
        return $res;
    }
    // Query all appointments for a particular event
    public function queryAppointments($id)
    {
        $res =  $this->getAppointmentData($id); 
        return $res;
    }

    // Query all events from the database
    function getEventData() {
        $query = "SELECT * FROM events"; 
        $result = $this->conn->query($query); // Executing the query and storing the result in the variable $result
        if($result->num_rows > 0) { // check if the query returned any rows (events)
            $events = []; // Array to store the events
            while($row = $result->fetch_assoc()) { // Loop through all rows
                // Create a new event object for each row and store it in the array $events
                $event = new Event($row["eventID"], $row["title"], $row["location"], $row["expiry_date"], $row["duration_in_minutes"]);
                array_push($events, $event); // Add the new event to the array $events
            }
            return $events; // Return the array $events itself
        } else { // Error message if the query did not return any rows
            error_log("No events found"); 
            return null;
        }
    }
    
    // Query all appointments for a specific event from the database
    function getAppointmentData($id) {
        $query = "SELECT * FROM appointments WHERE eventID_fk = $id"; // SQL query to select all appointments for a specific event from the database
        $result = $this->conn->query($query); 
        if($result->num_rows > 0) { 
            $appointments = []; 
            while($row = $result->fetch_assoc()) { 
                $appointment = new Appointment($row["appointmentID"], $row["date"], $row["starttime"], $row["endtime"]);
                array_push($appointments, $appointment); 
            }
            return $appointments; 
        } else {
            error_log("No appointments found"); 
            return null;
        }
    }

    function saveEvent($title, $location, $expiry_date, $duration_in_minutes) {
        $success = true; // Variable stores the success of the transaction
        $this->conn->begin_transaction(); // Start a transaction to insert the event
        try {
            $stmt = $this->conn->prepare("INSERT INTO events (title, location, expiry_date, duration_in_minutes) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("sssi", $title, $location, $expiry_date, $duration_in_minutes);
            $stmt->execute();
            $event_id = $this->conn->insert_id; // Getting the id of the inserted event
            $stmt->close();
            $this->conn->commit(); // Committing the transaction
        } catch (Exception $e) {   // If an exception occurs during the insertion, the code in the catch block will be executed instead
            $success = false;
            $this->conn->rollback();  // Rollback the transaction if the insertion was not successful
            error_log("datahandler");
            error_log($e->getMessage());
        }
        return ($success) ? $event_id : null; // Return the event id if the insertion was successful, otherwise return null
    }
    
    function saveAppointment ($eventID_fk, $date, $starttime, $endtime) {
        error_log("saveAppointment");
        $success = true; // Variable to store the success of the transaction
        $this->conn->begin_transaction(); // Start a transaction to insert the appointments
        try { 
            $stmt = $this->conn->prepare("INSERT INTO appointments (eventID_fk, date, starttime, endtime) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("isss", $eventID_fk, $date, $starttime, $endtime);
            $stmt->execute();
            $stmt->close();
            $this->conn->commit(); // Committing the transaction
        } catch (Exception $e) {   // If an exception occurs during the insertion, the code in the catch block will be executed instead
            $success = false;
            $this->conn->rollback();  // Rollback the transaction if the insertion was not successful
            error_log("datahandler");
            error_log($e->getMessage());
        }
        return $success; // Return true if the insertion was successful, otherwise return false
    }

    function saveVote($name, $comment) {
        $success = true; // Variable to store the success of the transaction
        $this->conn->begin_transaction(); // Start a transaction to insert the votes and user input
        try { 
            $stmt = $this->conn->prepare("INSERT INTO users (name, comment) VALUES (?, ?)");
            $stmt->bind_param("ss", $name, $comment);
            $stmt->execute();
            $user_id = $this->conn->insert_id; // Getting the id of the inserted event
            $stmt->close();
            $this->conn->commit(); // Committing the transaction if the insertion was successful
        } catch (Exception $e) {   // If an exception occurs during the insertion, the code in the catch block will be executed instead
            $success = false;
            $this->conn->rollback();  // Rollback the transaction if the insertion was not successful
            error_log("datahandler");
            error_log($e->getMessage());
        }
        return ($success) ? $user_id : null; // Return the user id if the insertion was successful, otherwise return null
    }

    function getVoteCount($id) {
        // Query to count all votes for a specific appointment
        $query = "SELECT COUNT(*) as count FROM appointments_users WHERE appointmentsID_fk = $id"; 
        $result = $this->conn->query($query); // Executing the query and storing the result in the variable $result
        $row = $result->fetch_assoc();  // Fetch the next row of the result set and return it as an associative array in the variable $row
        return $row['count'];
    }

    function getVotingInfo($id) {
        // Query to get all users who voted for a specific appointment
        $query = "SELECT * FROM users u JOIN appointments_users a ON u.userID = a.userID_fk WHERE appointmentsID_fk = $id";
        $result = $this->conn->query($query);
        $votingInfo = array();
        while ($row = $result->fetch_assoc()) {
            $votingInfo[] = $row;
        }
        return $votingInfo;
    }
    
    
    // Store the appointments that a user has voted for in the database
    function saveVotedAppointments($userID, $voteData){
        // Check if votedAppointments is an array
        if (!is_array($voteData)) {
            return null;
        }
        
        //Store each checked Appointment in db with userID
        foreach ($voteData as $appointmentid) {
            $stmt = $this->conn->prepare("INSERT INTO appointments_users (appointmentsID_fk, userID_fk) VALUES (?, ?)");
            $stmt->bind_param("ii", $appointmentid, $userID);
            $stmt->execute();
            $stmt->close();
        }
        
        
        return 1;
    }
    
}

