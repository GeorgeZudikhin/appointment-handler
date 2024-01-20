// Get Votes Count
function getVoteCount(appointmentID) {
    var voteCount = null;
    $.ajax({
      type: "GET",
      url: "../backend/serviceHandler.php",
      cache: false,
      async: false, // Async to false -> return value
      data: { method: "getVoteCount", param: appointmentID },
      dataType: "json",
      success: function (response) {
        voteCount = response;
      },
      error: function (e) {
        console.log("error get vote count");
      },
    });
    return voteCount; // Returning the vote count
  }
  