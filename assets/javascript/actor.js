
// Upload Actors
//var actor = [""]
// ajax "GETS" from API URL
//var queryURL = "https://api.themoviedb.org/3/search/person?" + "&api_key=d193944f1aacbf2bd9a52d10a441077f&query=brad+pitt";
 //-->                                                      // the query string will help us upload picture from website picture.
//API KEY: d193944f1aacbf2bd9a52d10a441077f

/* $.ajax({
    url: queryURL,
    method: "GET"
})
.then(function(response){
console.log(response)
}).then(function(reponse) {
    $("#celebImg").img(JSON.stringify(response));
});  

// Function For Celebrity Search  
$("#tdmbSubmit").on("click", function(event) {
    
    event.preventDefault();

    var celebrity = $("#celebritySearch").val();
} */


//Upload Actor img
$("#tdmbSubmit").on("click", function(event) {

    // event.preventDefault() can be used to prevent an event's default behavior.
    // Here, it prevents the submit button from trying to submit a form when clicked
    event.preventDefault();

    // Here we grab the text from the input box
    var celebrity = $("#celebritySearch").val();

    // Here we construct our URL
    var queryURL = "https://api.themoviedb.org/3/search/person?" + "&api_key=d193944f1aacbf2bd9a52d10a441077f&query="+ celebrity;

    // Write code between the dashes below to hit the queryURL with $ajax, then take the response data
    // and display it in the div with an id of celebImg.
    then() 

    $.ajax({
        url: queryURL,
        method: "GET"
      }).then(function(response) {
        $("#celebImg").text(JSON.stringify(response));
      });

});

/*

// Possibly add trending persons

var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://api.themoviedb.org/3/trending/person/week?api_key=d193944f1aacbf2bd9a52d10a441077f",
  "method": "GET",
  "headers": {},
  "data": "{}"
}

$.ajax(settings).done(function (response) {
  console.log(response);
}); */

