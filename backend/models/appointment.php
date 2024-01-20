<?php
class Appointment { // Appointment class
    public $appointmentid;
    public $date;
    public $starttime;
    public $endtime;

    function __construct($appointmentid, $date, $starttime, $endtime) {  // The constructor of the class takes four arguments and 
        $this->appointmentid = $appointmentid;                           // initializes the properties with these values             
        $this->date = $date;
        $this->starttime = $starttime;
        $this->endtime = $endtime;
      }
}
