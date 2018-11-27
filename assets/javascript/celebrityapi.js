$(document).ready(function () {

    //When the page loads get the top 10 celebrity images for the day from the celebrity api
    $.ajax({
        "url": `https://api.themoviedb.org/3/trending/person/day?api_key=d193944f1aacbf2bd9a52d10a441077f`,
        "method": "GET"
    }).done(function (response) {

        //If the response and results are defined
        if (response && response.results) {
            
            var celebrityCarousel = $("#celebrityCarousel .carousel-inner");

            //Remove all images from the celebrity carousel
            celebrityCarousel.empty();

            //Loop thru all the results and create divs and images for each
            for (var i = 0; i < response.results.length && i <= 10; i++) {
                var result = response.results[i];

                if (result.profile_path) {
                    
                    var carouselItem = $("<div class='carousel-item'>");

                    //Set the first item as active
                    if (i === 0){
                        carouselItem.addClass("active");
                    }

                    var celebImgUrl = `https://image.tmdb.org/t/p/w500${result.profile_path}`;
                    var celebImg = $(`<img class="celebImg" src="${celebImgUrl}">`);
                    carouselItem.append(celebImg);

                    //Add the carousel item to the celebrity carousel
                    celebrityCarousel.append(carouselItem);
                }
            }
        }
    });

    //Celebrity search button on click function
    $("#tdmbSubmit").on("click", function (event) {

        //Prevent submit button from refreshing
        event.preventDefault();
        //Get the celebrity name they entered to search for
        var celebrityName = $("#celebritySearch").val();

        //Assign settings for the ajax request
        //Perform the api search using ajax
        $.ajax({
            "url": `https://api.themoviedb.org/3/search/person?include_adult=false&page=1&language=en-US&api_key=d193944f1aacbf2bd9a52d10a441077f&query=${encodeURIComponent(celebrityName)}`,
            "method": "GET"
        }).done(function (response) {

            //If the response and results are defined
            if (response && response.results) {

                //Set the celebrity image url
                var celebImgUrl = `https://image.tmdb.org/t/p/w500${response.results[0].profile_path}`;
                $("#celebImg").attr("src", celebImgUrl);
            }
        });
    });
});