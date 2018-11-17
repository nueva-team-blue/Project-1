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


$(document).ready(function () {
    var facePlusPlusApiKey = "JJQp0B8tMyOhqZrJ-xzyZSwSG95sOXLM";
    var facePlusPlusApiSecret = "N5PgkpS-JtqonjgCVz2yB89FGbpoITrP";
    $("#compareButton").attr("disabled", true);

    function compareFace(celebImageUrl, myImageUrl) {

        console.log()

        myImageUrl = encodeURIComponent(myImageUrl);
        celebImageUrl = encodeURIComponent(celebImageUrl);

        var queryURL = `https://api-us.faceplusplus.com/facepp/v3/compare?api_key=${facePlusPlusApiKey}&api_secret=${facePlusPlusApiSecret}&image_url1=${myImageUrl}&image_url2=${celebImageUrl}`;
        console.log(queryURL);

        $.ajax({
            url: queryURL,
            method: "POST",
            error: function (resp) {
                console.log(resp);
            }
        }).then((response) => {

            var comparePercentage = response.confidence ? response.confidence : 0;

            $("#comparePercent").text(comparePercentage);
            console.log(response);
        });
    }

    
    $("#myImageUpload").on("change", function (event) {

        //Disable compare button
        $("#compareButton").attr("disabled", true);

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

            },

            function complete() {
                storageRef.getDownloadURL()
                    .then((url) =>{

                        $("#yourImg").attr("src", url);
                        $("#compareButton").attr("disabled", false);
                    });
            }
        );
    });
    

    /*     $.cloudinary.config({ cloud_name: 'dxtyykqf6', secure: true }); */

    /*
    if ($.fn.cloudinary_fileupload !== undefined) {

        $('#myImageUpload').unsigned_cloudinary_upload("ftfp21bf",
            {
                cloud_name: 'dxtyykqf6', tags: 'browser_uploads',
                folder: 'NW-Project-1'
            }
        )
            .bind('cloudinarydone', function (e, data) {

                $("#yourImg").attr("src", data.result.url);
                $("#compareButton").attr("disabled", false);
            })
            .bind('cloudinaryprogress', function (e, data) {

                $("#compareButton").attr("disabled", true);
                $("#comparePercent").text("");

                var progress = Math.round((data.loaded * 100.0) / data.total) + "%";

                $(".progress-bar").width(progress);
            });
    }
    */

    $("#compareButton").on("click", function () {

        var celebImageUrl = $("#celebImg").attr("src");
        var myImageUrl = $("#yourImg").attr("src")
        compareFace(celebImageUrl, myImageUrl);
    });
});