<?php
include("./db/dataHandler.php");

class SimpleLogic  // The purpose of this class is to handle requests and delegate the appropriate action to the DataHandler instance
{
    private $dh;
    function __construct()
    {
        $this->dh = new DataHandler();
    }

    public function handleRequest($method, $param)
    {
        switch ($method) {
            case "getEvents":
                $res = $this->dh->queryEvents();
                break;
            case "getAppointments":
                $res = $this->dh->queryAppointments($param);
                break;
            case "saveEvent":
                $res = $this->dh->saveEvent($param["title"], $param["location"], $param["expiry_date"], $param["duration_in_minutes"]);
                break;
            case "saveVote":
                $res = $this->dh->saveVote($param["name"], $param["comment"]);
                break;
            case "saveVotedAppointments": 
                $res = $this->dh->saveVotedAppointments($param["userID"], $param["voteData"]);
                break; 
            case "saveAppointment": 
                $res = $this->dh->saveAppointment($param["eventID"], $param["date"], $param["starttime"], $param["endtime"]);
                break;
            case "getVotingInfo":  
                $res = $this->dh->getVotingInfo($param);
                break;
            case "getVoteCount":  
                $res = $this->dh->getVoteCount($param);
                break;
            default:
                $res = null;
                break;
        }
        return $res;
    }
}
?>