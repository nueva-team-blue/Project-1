$(document).ready(function () {

    //Set the global variables
    var scoreboardCollection = db.collection("scoreboard");

    //Attach on change event to the span where we display the compare percentage
    $("#comparePercent, #carouselComparePercent").on("change", addToScoreboard);

    //Function will run when compare button is pressed and will add users results to the scoreboard in the fire database
    function addToScoreboard() {

        //Check to make sure the user is logged in
        var dopplegangerAuthentication = getCookie(authenticationCookieName);

        //Only run function if the user is logged in
        if (dopplegangerAuthentication) {

            //Get the percentage element that was changed
            var percentageElement = $(this);

            //Get the compare percentage from the text of the current span and use parseFloat to parse the string value as a float
            var comparePercent = parseFloat(percentageElement.text());

            //Make sure that the number valid
            if (comparePercent) {

                //Get all documents currently in the scoreboard in firebase (ordered by comparePercent)
                scoreboardCollection.orderBy("comparePercent")
                    .get()
                    .then(function (scoreboardSnapshot) {

                        //Get the user's display name
                        var userDisplayName = $("#signInButton").attr("data-user-display-name");

                        //If the percentage change was for the search celebrity section 
                        //then get the celebrity name from the celebSearchName element
                        //else get it from the celebCarouselName element
                        var celebrityName = (percentageElement.attr("id") == "comparePercent") ? $("#celebSearchName").text() : $("#celebCarouselName").text();

                        //If there are existing documents in the scoreboard collection in firebase and there are 10 or more (we are limiting scoreboard to top 10)
                        if (scoreboardSnapshot && scoreboardSnapshot.docs && scoreboardSnapshot.docs.length >= 10) {

                            //Get the scoreboard value with the smallest compare percentage 
                            //Since we ordered by compare percentage in our query then the smallest will be the firest document in the snapshot.
                            var smallestScoreboardData = scoreboardSnapshot.docs[0].data();

                            //If the existing compare percentage is greater than the smallest existing value then replace that scoreboard value
                            if (comparePercent > smallestScoreboardData.comparePercent) {
                                //Replace the smallest scoreboard value with the current one
                                scoreboardSnapshot.docs[0].ref.update({
                                    userName: userDisplayName,
                                    celebrityName: celebrityName,
                                    comparePercent: comparePercent,
                                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                                })
                                    .then(function() {
                                        console.log("Document successfully updated!");
                                    });
                            }
                        }
                        //There are no documents in the scoreboard collection in firebase or there are less than 10 scoreboard values
                        else {

                            //Add the new scoreboard value to the fire database
                            scoreboardCollection.add({
                                userName: userDisplayName,
                                celebrityName: celebrityName,
                                comparePercent: comparePercent,
                                timestamp: firebase.firestore.FieldValue.serverTimestamp()
                            })
                                .then(function() {
                                    console.log("Document added!");
                                });
                        }
                    });
            }

        }
    }

    //Check when anything changes on the scoreboard collection within the fire database
    scoreboardCollection.onSnapshot(function (snapshot) { 

        //Check to make sure that there are docs
        if (snapshot && snapshot.docs && snapshot.docs.length > 0) {

            var snapshotDocs = snapshot.docs;

            //Sort the documents by compare percent (highest to lowest)
            snapshotDocs.sort(function(a, b) {
                return b.data().comparePercent - a.data().comparePercent;
            });

            //Empty the global results of all existing data
            $("#globalResults").empty();

            //Create the ol (ordered list) element
            var ol = $("<ol>");

            //Loop thru the scoreboard docs which will already be in highest to lowest order
            snapshotDocs.forEach(function(doc) {
              
                //Append the list item to the ol element
                ol.append(`<li>${doc.data().userName} looks ${doc.data().comparePercent}% like ${doc.data().celebrityName}</li>`);
            });

            //Append the ordered list element to the global results div
            $("#globalResults").append(ol);
        }
    });

    //getting the cookie
    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    };
});