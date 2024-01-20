<?php
class Event {  // Event class
    public $eventid;
    public $title;
    public $location;
    public $expiry_date;
    public $duration_in_minutes;

    function __construct($eventid, $title, $location, $expiry_date, $duration_in_minutes) {  // The constructor of the class takes five arguments and 
        $this->eventid = $eventid;                                                           // initializes the properties with these values                
        $this->title = $title;
        $this->location = $location;
        $this->expiry_date = $expiry_date;
        $this->duration_in_minutes = $duration_in_minutes;
      }
}
