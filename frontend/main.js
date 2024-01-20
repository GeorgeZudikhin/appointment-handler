$(document).ready(function () {
  // Create Event 
  $("#newEvent").hide();
  $("#appointmentOptions").hide();

  // Checking the expiry date of the new event
  var today = new Date().toISOString().split("T")[0];
  $("#newEventExpiryDate").attr("min", today);
  $("#newAppointmentDate").attr("min", today);
  // Load all events
  loadEvents();

  // Show/Hide the form for creating a new event
  $("#newEventButton").click(function () {
    if ($("#newEvent").is(":visible")) {
      $("#newEvent").slideUp();
    } else {
      $("#newEvent").slideDown();
    }
  });

  $("#submitEvent").click(function (e) {
    e.preventDefault(); // Prevent form from submitting automatically when button is clicked
    // Event data
    var title = $("#newEventTitle").val();
    var location = $("#newEventLocation").val();
    var expiryDate = $("#newEventExpiryDate").val();
    var duration = parseInt($("#newEventDuration").val());
    // Check if any of the values are empty
    if (!title || !location || !expiryDate || !duration) {
      alert("One or more values are empty!");
      return;
    }
    var newEvent = {
      title: title,
      location: location,
      expiry_date: expiryDate,
      duration_in_minutes: duration
    };
  
    // Create array of appointments
    var appointments = [];
  
    $("#newEventTitle").val("");
    $("#newEventLocation").val("");
    $("#newEventExpiryDate").val("");
    $("#newEventDuration").val("");
  
    $("#newEvent").fadeOut(function() {
      $("#appointmentOptions").fadeIn();
    });
  
    $("#submitAppointment").click(function (e) {
      e.preventDefault(); // Prevent form from submitting automatically when button is clicked
      // Appointment data
      var date = $("#newAppointmentDate").val();
      var startTime = $("#newAppointmentStartTime").val();
      var endTime = calculateEndTime(startTime, duration); // calculate end time
      var newAppointment = {
        date: date,
        start_time: startTime,
        end_time: endTime
      };
      // Add a new appointment to list
      appointments.push(newAppointment);
      $("#newAppointmentDate").val("");
      $("#newAppointmentStartTime").val("");
      console.log(appointments);
      // Check if the finish button is clicked
      $("#buttonFinish").off().on("click", function () {
        $("#appointmentOptions").fadeOut();
        saveEvent(newEvent, appointments);
      });
    });
    
  });

  // Show Appointments 
  $(document).on("mouseenter", ".eventRow", function () {
    if (!$(this).hasClass("expired")) {
      $(this).css("cursor", "pointer");
      $(this).css("background-color", "rgb(149, 187, 229)");
      // Change title of event row to show or hide appointment options depending on whether they are shown or not
      if ($(this).next().hasClass("appointmentHeader")) {
        $(this).attr("title", "click to hide appointment options");
      } else {
        $(this).attr("title", "click to show appointment options");
      }
    }
    else{
      $(this).css("cursor", "pointer");
      $(this).css("background-color", "rgb(252, 64, 61)");
      if ($(this).next().hasClass("appointmentHeader")) {
        $(this).attr("title", "click to hide final votings");
      } else {
        $(this).attr("title", "click to show final votings");
      }

    }
  });
  
  $(document).on("mouseleave", ".eventRow", function () {
    if (!$(this).hasClass("expired")) {
      $(this).css("background-color", "inherit");
    }else{
      $(this).css("background-color", "lightgray");
    }
  });

  $(document).on("mouseenter", ".voteCheckbox", function () {
    $(this).css("cursor", "pointer");
  });
  $(document).on("mouseenter", ".voteCountCell", function () {
    $(this).css("cursor", "pointer");
  });
});

function calculateEndTime(startTime, duration) {
  var start = moment(startTime, "HH:mm"); // Parse starttime to moment object
  var end = start.clone().add(duration, "minutes"); // Clone starttime and add duration in minutes
  return end.format("HH:mm"); // Return the endtime
}

