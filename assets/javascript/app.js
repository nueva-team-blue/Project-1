
$(document).ready(function () {
    var facePlusPlusApiKey = "JJQp0B8tMyOhqZrJ-xzyZSwSG95sOXLM";
    var facePlusPlusApiSecret = "N5PgkpS-JtqonjgCVz2yB89FGbpoITrP";
    $("#compareButton, #carouselCompareButton").attr("disabled", true);

    //Hide carousel, results, and about us divs by default
    $("#celebCarouselBody").hide();
    $("#resultsBody").hide();
    $("#aboutUsBody").hide();

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyD0ZvalX1bGNXAmc6BQZd8m9iJWIbl-4hQ",
        authDomain: "doppelgangers-d712f.firebaseapp.com",
        databaseURL: "https://doppelgangers-d712f.firebaseio.com",
        projectId: "doppelgangers-d712f",
        storageBucket: "doppelgangers-d712f.appspot.com",
        messagingSenderId: "169783188463"
    };
    firebase.initializeApp(config);

    // Initialize Cloud Firestore through Firebase
    var db = firebase.firestore();

    // Disable deprecated features
    db.settings({
        timestampsInSnapshots: true
    });

    //Google SignIn Authentication function
    googleSignIn = () => {
        base_provider = new firebase.auth.GoogleAuthProvider()
        firebase.auth().signInWithPopup(base_provider).then(function (result) {
            console.log(result);
            console.log("Success Google Account Linked");

            console.log(result.user.displayName);
            console.log(result.user.email);

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

        myImageUrl = encodeURIComponent(myImageUrl);
        celebImageUrl = encodeURIComponent(celebImageUrl);

        var queryURL = `https://api-us.faceplusplus.com/facepp/v3/compare?api_key=${facePlusPlusApiKey}&api_secret=${facePlusPlusApiSecret}&image_url1=${myImageUrl}&image_url2=${celebImageUrl}`;

        return $.ajax({
            url: queryURL,
            method: "POST",
            error: function (resp) {
                console.log(resp);
            }
        });
    }


    $(".myImageUpload").on("change", function (event) {

        //Set image to default
        $(".yourImg").attr("src", "assets/images/placeholder.jpg");

        //Disable compare button
        $("#compareButton, #carouselCompareButton").attr("disabled", true);

        //Update the progress bar to 0%
        $(".progress-bar").width(0);

        //Get the file
        var file = event.target.files[0];

        //Create storage ref
        var storageRef = firebase.storage().ref(`Pictures/${file.name}`);

        //Upload file
        var task = storageRef.put(file);

        //Update progress bar
        task.on("state_changed",

            function progress(snapshot) {
                var percentage = (snapshot.bytesTransferred /
                    snapshot.totalBytes) * 100;


                $(".progress-bar").width(`${percentage}%`);
            },

            function error(err) {
                console.log(err);
            },

            function complete() {
                storageRef.getDownloadURL()
                    .then((url) => {

                        $(".yourImg").attr("src", url);
                        $("#compareButton, #carouselCompareButton").attr("disabled", false);
                    });
            }
        );
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

    function activateAnimateButton(buttonElement) {

        buttonElement.addClass("active");
        buttonElement.attr("disabled", true);
    }

    function deactivateAnimateButton(buttonElement) {

        buttonElement.removeClass("active");
        buttonElement.attr("disabled", false);
    }

    function handleCompareButtonClick(buttonElement, percentElement, celebImageUrl) {
        percentElement.text("");
        activateAnimateButton(buttonElement);

        var myImageUrl = $(".yourImg").attr("src")

        compareFace(celebImageUrl, myImageUrl)
            .then((response) => {

                var comparePercentage = response.confidence ? response.confidence : 0;

                percentElement.text(comparePercentage);
                deactivateAnimateButton(buttonElement);
            })
            .catch((error) => {

                var errorMessage = "Error comparing image in face++";

                if (error && error.responseJSON && error.responseJSON.error_message) {
                    errorMessage = error.responseJSON.error_message;
                }

                percentElement.html(`<span style="color:red">${errorMessage}</span>`);
                deactivateAnimateButton(buttonElement);
            });
    }

    $("#compareButton").on("click", function () {
        handleCompareButtonClick($(this), $("#comparePercent"), $("#celebImg").attr("src"));
    });

    $("#carouselCompareButton").on("click", function () {
        handleCompareButtonClick($(this), $("#carouselComparePercent"), $("#celebrityCarousel .carousel-item.active img").attr("src"));
    });

    //Attach event when user clicks on the default page link
    $(".homeLink").on("click", function () {

        $("#celebSearchBody").show();
        $("#celebCarouselBody").hide();
        $("#resultsBody").hide();
        $("#aboutUsBody").hide();

        $(".navbar-nav li").removeClass("active");
        $(".navbar-nav li .homeLink").parent().addClass("active");
        closeHamburberMenu();
    });

    //Attach event when user clicks on the carousel page link
    $("#carouselLink").on("click", function () {

        $("#celebSearchBody").hide();
        $("#celebCarouselBody").show();
        $("#resultsBody").hide();
        $("#aboutUsBody").hide();

        $(".navbar-nav li").removeClass("active");
        $(".navbar-nav li #carouselLink").parent().addClass("active");
        closeHamburberMenu();
    });

    //Attach event when user clicks on the results page link
    $("#resultsLink").on("click", function () {

        $("#celebSearchBody").hide();
        $("#celebCarouselBody").hide();
        $("#resultsBody").show();
        $("#aboutUsBody").hide();

        $(".navbar-nav li").removeClass("active");
        $(".navbar-nav li #resultsLink").parent().addClass("active");
        closeHamburberMenu();

    });

    $('.carousel').carousel({
        interval: false
    });

    //Attaching on click function to signin button
    $("#signInButton").on("click", googleSignIn);
});