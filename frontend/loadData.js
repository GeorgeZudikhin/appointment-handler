// Load Events 
function loadEvents() {
  $.ajax({
    type: "GET",
    url: "../backend/serviceHandler.php",
    cache: false,
    data: { method: "getEvents" },
    dataType: "json",
    success: function (response) {
      console.log(response);
      // Sorting events by expiry_date
      response.sort(function (a, b) {
        return new Date(a.expiry_date) - new Date(b.expiry_date);
      });
      $.each(response.reverse(), function (i, p) {
        var expiryDate = new Date(p.expiry_date);
        var today = new Date();
        var dateParts = p.expiry_date.split("-"); // Split the date
        var formattedDate = dateParts[2] + "." + dateParts[1] + "." + dateParts[0]; // Rearrange the date parts in the desired format
        if (expiryDate >= today) {  // Checking if expiry date has passed
          var $eventRow = $(        // Adding an event to the table
            "<tr class='eventRow'><td>" +
              p.title +
              "</td><td>" +
              p.location +
              "</td><td>" +
              formattedDate +
              "</td><td>" +
              p.duration_in_minutes +
              "</td></tr>"
          );
          $("#table").append($eventRow);
          $eventRow.on("click", function () {
              loadAppointments($eventRow, p.eventid);
            $("#description").html("Click on the vote count to show all votes.");
          });
        } 
        else {
          // When expiry date has passed
          var $eventRow = $(
            "<tr class='eventRow expired'><td>" +
              p.title +
              "</td><td>" +
              p.location +
              "</td><td>" +
              formattedDate +
              "</td><td>" +
              p.duration_in_minutes +
              "</td></tr>"
          );
          $("#table").append($eventRow);
          $eventRow.on("click", function () {
            loadFinalVotings($eventRow, p.eventid);
          $("#description").html("Click on the vote count to show all votes.");
        });
        }
      });
    },
    error: function (e) {
      console.log("error events");
    },
  });
}

function loadFinalVotings($row, event_id) {
  console.log(event_id);
  var votingInfoShown = false;
  // Check if appointments are already shown
  if ($row.next().hasClass("appointmentHeader")) {
    // Remove appointments if so
    $row.nextAll(".appointmentHeader, .appointmentRow").fadeOut(function () {
      $(this).remove();
      $row.nextAll(".eventRow").add($row.prevAll(".eventRow")).fadeIn();
      $("#description").html("Click on any event to show the available appointment options.");
        $(".votingInfo, .votingInfoRow").fadeOut(function () {    // Check if voting info is shown
          $(this).remove();
          votingInfoShown = false;
        });
    });
  } else {
    // AJAX-Call to get appointments data
    $.ajax({
      type: "GET",
      url: "../backend/serviceHandler.php",
      cache: false,
      data: { method: "getAppointments", param: event_id },
      dataType: "json",
      success: function (response) {
        console.log(response);
        $row.after("<tr class='appointmentHeader'><th>Date</th><th>Time</th><th>Final Votes</th><th>Vote Percentage</th></tr>");
        // Add appointments data
        var totalVotes = getTotalVotes(response);
        $.each(response, function (i, p) {
          var dateParts = p.date.split("-"); // Split the date
          var formattedDate = dateParts[2] + "." + dateParts[1] + "." + dateParts[0]; // Rearrange the date parts
          var startTime = p.starttime.substring(0, 5);
          var endTime = p.endtime.substring(0, 5);
          var voteCount = getVoteCount(p.appointmentid);
          var votePercentage = ((voteCount / totalVotes) * 100).toFixed(2);
          var $voteBar = $("<div class='voteBar'></div>").css({
            height: "10px",
            backgroundColor: "#E2E2E2",
            position: "relative",
            overflow: "hidden"
          });
                      
          $voteBar.append("<div class='voteBarInner'></div>").find(".voteBarInner").css({
            height: "100%",
            backgroundColor: "#4CAF50",
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            transformOrigin: "left"
          }).animate({ width: votePercentage + "%" }, 1000);
          

          var $appointmentRow = $(
            "<tr class='appointmentRow'><td>" +
            formattedDate +
            "</td><td>" +
            startTime +
            " - " +
            endTime +
            "</td><td class='voteCountCell'>" +
            voteCount +
            "</td><td class='votePercentageCell'></td></tr>"
        );
        
        $appointmentRow.find(".votePercentageCell").append($voteBar);
        $(".appointmentHeader").after($appointmentRow);
        
          $appointmentRow.find(".voteCountCell").on("click", function () {
            showVotingInfo($appointmentRow, p.appointmentid);
          });
        });
        //hide all other events
        $row.nextAll(".eventRow").add($row.prevAll(".eventRow")).fadeOut();
        // Slide down appointments table
        $row.nextAll(".appointmentHeader, .appointmentRow").hide().fadeIn();
      },
      error: function (e) {
        console.log("error appointments");
      },
    });
  }

  function getTotalVotes(appointments) {
    var totalVotes = 0;
    $.each(appointments, function (i, p) {
      totalVotes += parseInt(getVoteCount(p.appointmentid));
    });
    return totalVotes;
  }
}

// Loading Appointments 
function loadAppointments($row, event_id) {
  console.log(event_id);
  var votingInfoShown = false;
  // Check if appointments are already shown
  if ($row.next().hasClass("appointmentHeader")) {
    // Remove appointments if so
    $row.nextAll(".appointmentHeader, .appointmentRow").fadeOut(function () {
      $(this).remove();
      $row.nextAll(".eventRow").add($row.prevAll(".eventRow")).fadeIn();
      $("#description").html("Click on any event to show the available appointment options.");
      // Check if voting info is shown and hide it
        $(".votingInfo, .votingInfoRow").fadeOut(function () {
          $(this).remove();
          votingInfoShown = false;
        });
    });
  } 
  else {
    // AJAX-Call to get appointments data
    $.ajax({
      type: "GET",
      url: "../backend/serviceHandler.php",
      cache: false,
      data: { method: "getAppointments", param: event_id },
      dataType: "json",
      success: function (response) {
        console.log(response);
        // Add table headers
        $row.after(
          "<tr class='appointmentHeader'><th>Date</th><th>Time</th><th>Vote</th><th>Votes so far</th></tr>"
        );
        $(".appointmentHeader").after(
          "<tr class='appointmentRow'><td colspan='5'><button class='btn-secondary' id='submitVote'>Submit</button></td></tr>"
        );
        $(".appointmentHeader").after(
          "<tr class='appointmentRow'><th>Comment: </th><td colspan='2'><textarea class='commentInput' rows='4' cols='50' placeholder='Your comment...'></textarea></td><td></td></tr>"
        );
        var $nameInput = $("<input type='text' class='nameInput'>");
        $(".appointmentHeader").after(
          "<tr class='appointmentRow'><th>Name: </th><td><input type='text' class='nameInput' required placeholder='Your name'></td><td></td><td></td>"
        );
        // Add appointment data
        $.each(response, function (i, p) {
          var dateParts = p.date.split("-"); // Split the date
          var formattedDate = dateParts[2] + "." + dateParts[1] + "." + dateParts[0]; // Rearrange the date parts
          var startTime = p.starttime.substring(0, 5);
          var endTime = p.endtime.substring(0, 5);

          var $voteCell = $(
            "<td><input type='checkbox' class='voteCheckbox' id='appointment_" +
              p.appointmentid +
              "'></td>"
          );
          var voteCount = getVoteCount(p.appointmentid);
          var $appointmentRow = $(
            "<tr class='appointmentRow'><td>" +
              formattedDate +
              "</td><td>" +
              startTime +
              " - " +
              endTime +
              "</td><td>" +
              $voteCell.html() +
              "</td><td class='voteCountCell'>" +
              voteCount +
              "</td></tr>"
          );
          $(".appointmentHeader").after($appointmentRow);
          $appointmentRow.find(".voteCountCell").on("click", function () {
            showVotingInfo($appointmentRow, p.appointmentid);
          });
          // Add event listener for vote checkboxes to update vote count cells
          $voteCell.find(".voteCheckbox").on("change", function () {
            getVoteCount(p.appointmentid).done(function (voteCount) {
              $appointmentRow.find(".voteCountCell").text(voteCount);
            });
          });
          // Add event listener for vote checkboxes
          $voteCell.find(".voteCheckbox").on("change", function () {
            if ($(this).is(":checked")) {
              $nameInput.prop("disabled", false);
            } else {
              $nameInput.prop("disabled", true);
            }
          });
        });
        $row.nextAll(".eventRow").add($row.prevAll(".eventRow")).fadeOut();
        $row.nextAll(".appointmentHeader, .appointmentRow").hide().fadeIn();
        $("#submitVote").on("click", function () {
          if ($(".voteCheckbox:checked").length === 0) {   // Checking if checkboxes are checked
            alert("Please select at least one option.");
            return;
          }
          if ($(".nameInput").val().trim() === "") {  // Checking the name input
            alert("Please enter your name.");
            return;
          }
          saveVote(event_id); // Save vote to database
        });
      },
      error: function (e) {
        console.log("error appointments");
      },
    });
  }
}

function showVotingInfo($row, appointmentID) {
  // Check if voting info is already shown
  if ($row.next().hasClass("votingInfo")) {
    // Remove voting info if so
    $row.nextAll(".votingInfo, .votingInfoRow").fadeOut(function () {
      $(this).remove();
    });
  } else {
    // Close any previously open voting info
    if ($row.prevAll().hasClass("votingInfoRow")) {
      // Remove voting info if it's already shown
      $row.prevAll(".votingInfo, .votingInfoRow").fadeOut(function () {
        $(this).remove();
      })
    }
    // AJAX-Call to get voting info data
    $.ajax({
      type: "GET",
      url: "../backend/serviceHandler.php",
      cache: false,
      data: { method: "getVotingInfo", param: appointmentID },
      dataType: "json",
      success: function (response) {
        console.log(response);
        // Add table headers to table
        $row.after(
          "<tr class='votingInfo'><th>Name</th><th colspan='3'>Comment</th></tr>"
        );
        // Add voting info data to table rows
        $.each(response, function (i, p) {
          $(".votingInfo").after(
            "<tr class='votingInfoRow'><td>" +
              p.name +
              "</td><td colspan='3' class='comment'>" +
              p.comment +
              "</td></tr>"
          );
        });
      },
      error: function (e) {
        console.log("error voting info");
      },
    });
  }
}

