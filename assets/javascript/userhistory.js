//Set the global variables
var userHistory;

$(document).ready(function () {
    //Check to make sure the user is logged in
    var dopplegangerAuthentication = getCookie(authenticationCookieName);

    db.collection("users").where("email", "==", dopplegangerAuthentication).limit(1)
        .get()
        .then(function (snapshot) {
            assignUserHistoryVar(snapshot);
        });

    //Attach on change event to the span where we display the compare percentage
    $("#comparePercent, #carouselComparePercent").on("change", addToUserHistory);

    //Function will run when compare button is pressed and will add users results to the scoreboard in the fire database
    function addToUserHistory() {

        //Get authentication cookie
        dopplegangerAuthentication = getCookie(authenticationCookieName);

        //Only run function if the user is logged in
        if (dopplegangerAuthentication) {

            console.log("adding user history");

            //Get the percentage element that was changed
            var percentageElement = $(this);

            //Get the compare percentage from the text of the current span and use parseFloat to parse the string value as a float
            var comparePercent = parseFloat(percentageElement.text());

            //Make sure that the number valid
            if (comparePercent) {

                //Get the user's display name
                var userDisplayName = $("#signInButton").attr("data-user-display-name");
                //If the percentage change was for the search celebrity section 
                //then get the celebrity name from the celebSearchName element
                //else get it from the celebCarouselName element
                var celebrityName = (percentageElement.attr("id") == "comparePercent") ? $("#celebSearchName").text() : $("#celebCarouselName").text();
                //Add the new userHistory value to the fire database
                userHistory.add({
                    userName: userDisplayName,
                    celebrityName: celebrityName,
                    comparePercent: comparePercent,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })
                    .then(function () {
                        console.log("Document added!");
                    });

            }

        }
    }
});


function assignUserHistoryVar(userSnapshot) {
    if (userSnapshot && userSnapshot.docs && userSnapshot.docs.length > 0) {
        userHistory = userSnapshot.docs[0].ref.collection("userHistory");
        //Check when anything changes on the scoreboard collection within the fire database
        userHistory.onSnapshot(userHistorySnapshotChanged);
    }
}


function userHistorySnapshotChanged(snapshot) {
    //Check to make sure that there are docs
    if (snapshot && snapshot.docs && snapshot.docs.length > 0) {

        var snapshotDocs = snapshot.docs;

        //Sort the documents by timestamp (recent to oldest)
        snapshotDocs.sort(function (a, b) {
            var timestampA = a.data().timestamp ? a.data().timestamp.seconds : new Date();
            var timestampB = b.data().timestamp ? b.data().timestamp.seconds : new Date();

            return timestampB - timestampA;
        });

        //Empty the global results of all existing data
        $("#userResults").empty();

        //Create the ol (ordered list) element
        var ol = $("<ol>");

        //Loop thru the scoreboard docs which will already be in highest to lowest order
        snapshotDocs.forEach(function (doc, index) {

            //Only create a list item for the top 10 snapshot docs
            if (index < 10) {
                //Append the list item to the ol element
                ol.append(`<li><strong> ${doc.data().comparePercent}%</strong> like <em>${doc.data().celebrityName}</em></li>`);
            }
        });

        //Append the ordered list element to the your results div
        $("#userResults").append(ol);
    }
}