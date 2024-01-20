function saveAppointments(eventID, appointments) {
  $.each(appointments, function (i, p) {   // Loop through appointments and save each individually
    saveSingleAppointment(eventID, p["date"], p["start_time"], p["end_time"]);
  });
}

function saveSingleAppointment(eventID, date, starttime, endtime) {  
  $.ajax({                                      // AJAX-Call to send a POST request to the server to save a single appointment
    type: "POST",
    url: "../backend/serviceHandler.php",
    cache: false,
    data: {
      method: "saveAppointment",
      param: {
        eventID: eventID,
        date: date,
        starttime: starttime,
        endtime: endtime,
      },
    },
    dataType: "json",
    success: function (response) {
      console.log(response);
    },
    error: function (e) {
      alert("error save appointment");
      console.log("error save appointment");
    },
  });
}

function saveEvent(newEvent, appointments) {
  $.ajax({
    type: "POST",
    url: "../backend/serviceHandler.php",
    cache: false,
    data: {
      method: "saveEvent",
      param: {
        title: newEvent.title,
        location: newEvent.location,
        expiry_date: newEvent.expiry_date,
        duration_in_minutes: newEvent.duration_in_minutes,
      },
    },
    dataType: "json",
    success: function (response) {
      var eventID = response;
      console.log(response);
      console.log("In Call: "+ appointments);
      saveAppointments(eventID, appointments);
    },
    error: function (e) {
      console.log("error save event");
    },
  });
}


function saveVote(event_id) { 
  // Getting the name and comment data that the user has entered into input fields
  var name = $(".nameInput").val();
  var comment = $(".commentInput").val();

  // Check if at least one checkbox is checked and a name is provided
  if ($(".voteCheckbox:checked").length == 0 || name.trim() == "") {
    alert("Please select at least one appointment and provide your name.");
    return;
  }

  $.ajax({
    type: "GET",
    url: "../backend/serviceHandler.php",
    cache: false,
    data: { method: "getAppointments", param: event_id },
    dataType: "json",
    success: function (response) {
      console.log(response);
      var voteData = [];
      $.each(response, function (i, p) {
        if ($("#appointment_" + p.appointmentid + "").is(":checked")) {  // Checks whether each appointment's corresponding checkbox 
          voteData.push(p.appointmentid);                                // is checked and adds the appointment id to the voteData array
        }
      });

      // AJAX request to save vote
      $.ajax({
        type: "POST",
        url: "../backend/serviceHandler.php",
        cache: false,
        data: {
          method: "saveVote",
          param: {
            name: name,
            comment: comment,
          },
        },
        dataType: "json",
        success: function (response) {
          console.log(response);
          var userID = response;
          saveVotedAppointments(userID, voteData);
        },
        error: function (e) {
          console.log("error save vote");
        },
      });
    },
    error: function (e) {
      console.log("error appointments");
    },
  });
}


function saveVotedAppointments(userID, voteData) {
  $.ajax({
    type: "POST",
    url: "../backend/serviceHandler.php",
    cache: false,
    data: {
      method: "saveVotedAppointments",
      param: {
        userID: userID,
        voteData: voteData,
      },
    },
    dataType: "json",
    success: function (response) {
      console.log(response);
      // Refresh the page
      location.reload();
    },
    error: function (e) {
      console.log("error save voted appointments");
    },
  });
}
