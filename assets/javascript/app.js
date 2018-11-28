
//Name that will be used for the authentication cookie
var authenticationCookieName = "doppleganger-authentication";

$(document).ready(function () {

    //Assign face++ api key information
    var facePlusPlusApiKey = "JJQp0B8tMyOhqZrJ-xzyZSwSG95sOXLM";
    var facePlusPlusApiSecret = "N5PgkpS-JtqonjgCVz2yB89FGbpoITrP";

    //Disable the compare buttons by default
    $("#compareButton, #carouselCompareButton").attr("disabled", true);

    //Display the celebrity search section by default
    showHideSections(`.homeLink`, `#celebSearchBody`);

    //Hide the results link in the navbar by default (will only be shown when logged in)
    $("#resultsLink").hide();

    //Google SignIn Authentication function
    googleSignIn = () => {
        base_provider = new firebase.auth.GoogleAuthProvider()

        //Display google signin popup
        firebase.auth().signInWithPopup(base_provider).then(function (result) {

            //Create the authentication cookie. 
            setCookie(authenticationCookieName, result.user.email, 30);

            //checkAuthentication function will hide or show sections and display profile picture depending on if user is logged in
            checkAuthentication();

            console.log("Success Google Account Linked");

            //Query the database to see if a user with the same email already exists
            db.collection("users").where("email", "==", result.user.email)
                .get()
                .then(function (snapshot) {

                    //User already exists in the database
                    if (snapshot && snapshot.docs && snapshot.docs.length > 0) {
                        console.log("User already exists in database: ", snapshot.docs[0].data());
                    }
                    //User does not exist in database. Add user to the database
                    else {
                        db.collection("users").add({
                            displayName: result.user.displayName,
                            email: result.user.email,
                            photoURL: result.user.photoURL
                        })
                            .then(function (docRef) {
                                console.log("User written to database with docID: ", docRef.id);
                            })
                            .catch(function (error) {
                                console.error("Error adding user to database: ", error);
                            });
                    }

                    //checkAuthentication function will hide or show sections and display profile picture depending on if user is logged in
                    checkAuthentication();

                })
                .catch(function (error) {
                    console.log("Error getting documents: ", error);
                });

        }).catch(function (err) {
            console.log(err);
            console.log("Failed to connect");
        })
    }



    //Function to compare faces using the face++ api
    function compareFace(celebImageUrl, myImageUrl) {

        //Encode the image urls received so it can be placed as a query parameter in the face++ url
        myImageUrl = encodeURIComponent(myImageUrl);
        celebImageUrl = encodeURIComponent(celebImageUrl);

        //Build the query url used to send data to the face++ api
        var queryURL = `https://api-us.faceplusplus.com/facepp/v3/compare?api_key=${facePlusPlusApiKey}&api_secret=${facePlusPlusApiSecret}&image_url1=${myImageUrl}&image_url2=${celebImageUrl}`;

        //Return the ajax call that will send a POST to the face++ api
        return $.ajax({
            url: queryURL,
            method: "POST",
            error: function (resp) {
                console.log(resp);
            }
        });
    }

    //Attach on click event function when the user uploads their own image
    $(".myImageUpload").on("change", function (event) {

        //Set image to default
        $(".yourImg").attr("src", "assets/images/placeholder.png");

        //Disable compare button
        $("#compareButton, #carouselCompareButton").attr("disabled", true);

        //Update the progress bar to 0%
        $(".progress-bar").width(0);

        //Get the file
        var file = event.target.files[0];

        //Make sure file exists
        if (file) {
            //Create storage ref using firebase storage
            var storageRef = firebase.storage().ref(`Pictures/${file.name}`);

            //Upload file to firebase storage
            var task = storageRef.put(file);

            //Update progress bar
            task.on("state_changed",

                //Function will run when receiving progress updates while the images is uploading to firebase storage
                function progress(snapshot) {
                    //Calculate the percentage of the file that has been uploaded to firebase storage
                    var percentage = (snapshot.bytesTransferred /
                        snapshot.totalBytes) * 100;

                    //Update progress bar width to the percentage of the image upload that has been completed.
                    $(".progress-bar").width(`${percentage}%`);
                },

                //Function will run when there was an error uploading the image to firebase storage
                function error(err) {
                    console.log(err);
                },

                //Function run when upload to firebase storage has completed
                function complete() {
                    storageRef.getDownloadURL()
                        .then((url) => {

                            $(".yourImg").attr("src", url);
                            $("#compareButton, #carouselCompareButton").attr("disabled", false);
                        });
                }
            );
        }
    });

    //Function where if the hamburger menu button is visible then trigger an on 
    //click event on that button so it closes the hamburger menu
    function closeHamburberMenu() {

        if ($('.navbar-toggler').css('display') != "none") {

            if ($(".navbar-collapse").hasClass("show")) {
                $('.navbar-toggler').click();
            }
        }
    }

    //Function will start the spining wheel animation on a button
    function activateAnimateButton(buttonElement) {

        buttonElement.addClass("active");
        buttonElement.attr("disabled", true);
    }

    //Function will stop the spining wheel animation on a button
    function deactivateAnimateButton(buttonElement) {

        buttonElement.removeClass("active");
        buttonElement.attr("disabled", false);
    }

    //Function will run when a compare button is clicked
    function handleCompareButtonClick(buttonElement, percentElement, celebImageUrl) {

        //Clear the text that displays the face compare percentage to the user
        percentElement.text("");
        //Start the spinning wheel animation on the compare button
        activateAnimateButton(buttonElement);

        //Get the "your image" url from the img element that has a class of "yourImg"
        var myImageUrl = $(".yourImg").attr("src")

        //Send a request to face++ to compare "your image" to the celebrity image passed in as a parameter in this function
        compareFace(celebImageUrl, myImageUrl)
            .then((response) => {

                //If we received a confidence value back from face++ then use that as the percentage we will display to the user. Otherwise set it to 0.
                var comparePercentage = response.confidence ? response.confidence : 0;

                //Set the text that displays the face compare percentage to the user
                percentElement.text(comparePercentage);
                //Trigger change event on percentage element (this does not happen automatically on span elements)
                percentElement.change();
                //Stop the spinning wheel animation on the compare button
                deactivateAnimateButton(buttonElement);
            })
            .catch((error) => {

                //Get the error message received from face++ if there is one. Otherwise we will display a default error message of "Error comparing image in face++"
                var errorMessage = "Error comparing image in face++";

                if (error && error.responseJSON && error.responseJSON.error_message) {
                    errorMessage = error.responseJSON.error_message;
                }

                //Display the error message in the same place where we would have displayed the face compare percentage to the user
                percentElement.html(`<span style="color:red">${errorMessage}</span>`);
                //Stop the spinning wheel animation on the compare button
                deactivateAnimateButton(buttonElement);
            });
    }

    /*
    Attach on click event function to the "Celebrity Checker" compare button and 
    run the handleCompareButtonClick function passing in the compare button element,
    the element where we want the percentage to be displayed to the user, and the 
    celebrity image url
    */
    $("#compareButton").on("click", function () {
        handleCompareButtonClick($(this), $("#comparePercent"), $("#celebImg").attr("src"));
    });

    /*
    Attach on click event function to the "Celebrity Carousel" compare button and 
    run the handleCompareButtonClick function passing in the compare button element,
    the element where we want the percentage to be displayed to the user, and the 
    celebrity image url
    */
    $("#carouselCompareButton").on("click", function () {
        handleCompareButtonClick($(this), $("#carouselComparePercent"), $("#celebrityCarousel .carousel-item.active img").attr("src"));
    });

    //Attach event when user clicks on the default page link
    //Function will show or hide sections of the page
    $(".homeLink").on("click", () => showHideSections(`.homeLink`, `#celebSearchBody`));

    //Attach event when user clicks on the carousel page link
    //Function will show or hide sections of the page
    $("#carouselLink").on("click", () => showHideSections(`#carouselLink`, `#celebCarouselBody`));

    //Attach event when user clicks on the results page link
    //Function will show or hide sections of the page
    $("#resultsLink").on("click", () => showHideSections(`#resultsLink`, `#resultsBody`));

    //Function will show or hide sections depending on what link the user clicked on the navbar
    function showHideSections(navBarLinkElement, pageSectionToShow) {

        //Create an array will all the ids for the page sections that we will hide
        var pageSectionsToHide = ["#celebSearchBody", "#celebCarouselBody", "#resultsBody", "#aboutUsBody"];

        //Remove the page section will will show from the pageSectionsToHide array
        pageSectionsToHide.splice(pageSectionsToHide.indexOf(pageSectionToShow), 1);

        //Convert pageSectionsToHide array to a string and seperate each with a comma by using join then use
        //that as the jQuery selector and the hide method to hide those sections
        $(pageSectionsToHide.join(',')).hide();

        //Show the appropriate page section
        $(pageSectionToShow).show();

        //Remove the active class from all the links on the nav bar
        $(".navbar-nav li").removeClass("active");
        //Add the active class to the parent element of the nav bar link element that was clicked
        $(navBarLinkElement).parent().addClass("active");
        //Close the hamburger menu if it's being displayed on smaller screens
        closeHamburberMenu();
    }

    //Initialize the carousel and force it to not auto rotate images
    $('.carousel').carousel({
        interval: false
    });

    //Attaching on click function to signin button
    $("#signInButton").on("click", googleSignIn);

    //function to check authentication cookie
    function checkAuthentication() {
        var dopplegangerAuthentication = getCookie(authenticationCookieName)
        if (dopplegangerAuthentication) {

            //Hide the sign in button
            $("#signInButton").hide();

            //Show the results link in the navbar
            $("#resultsLink").show();

            //Get the profile image url from the database
            db.collection("users").where("email", "==", dopplegangerAuthentication)
                .get()
                .then(function (snapshot) {

                    //User already exists in the database
                    if (snapshot && snapshot.docs && snapshot.docs.length > 0) {

                        //Set the image source to the photo url from the fire database
                        $(".yourImg").attr("src", snapshot.docs[0].data().photoURL);
                        // enables the compare button
                        $("#compareButton, #carouselCompareButton").attr("disabled", false);

                        //Store the user's display name as an attribute on the signInButton element
                        $("#signInButton").attr("data-user-display-name", snapshot.docs[0].data().displayName);

                    }
                });
        }
        else {
            //Show the sign in button
            $("#signInButton").show();
            //Hide the results link in the navbar
            $("#resultsLink").hide();
        }
    }

    //Check authtentication and hide necessary sections
    checkAuthentication();

    //function that sets cookie
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

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

    //Choose a random picture from the carousel
    function getRandomCarouselPic() {

        //Spin the dice on the choose random button
        $("#randomCarouselChoice .fa-dice").addClass("fa-spin");

        //Assign local variables
        var celebrityCarouselElement = $("#celebrityCarousel");
        var carouselItems = celebrityCarouselElement.find(".carousel-item");

        //Remove any existing on "slid.bs.carousel" event listeners
        celebrityCarouselElement.off("slid.bs.carousel");

        //Get a random index from the total number of itmes in the carousel
        var randomNum = Math.floor(Math.random() * carouselItems.length);

        //Force the carousel to start cycling
        celebrityCarouselElement.carousel('next');
        celebrityCarouselElement.on("slid.bs.carousel", function () {
            celebrityCarouselElement.carousel('next');
        });

        //After 2 seconds stop the carousel from cycling, set the photo to the random number,
        //and stop the dice from spinning
        setTimeout(() => {
            celebrityCarouselElement.off("slid.bs.carousel");
            celebrityCarouselElement.carousel(randomNum);
            $("#randomCarouselChoice .fa-dice").removeClass("fa-spin");
        }, 2000);
    };

    //Add on click event to choose random button in carousel section
    $("#randomCarouselChoice").on("click", getRandomCarouselPic);
});