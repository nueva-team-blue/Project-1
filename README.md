# Project-1

This project is an entertainment product.  It allows users to upload a photo of themselves/whoever and compare it against celebrities.  They can either do a search or use a top10 daily trending carousel to compare against.  If logged in, they will be able to review their recent 10 results as well as the global top 10 results across all users.

-------------------------------------

This uses the following APIs:

Face++
The Movie DataBase (TMDB)
Firebase
Firestore
Firestorage

Frameworks used:

jQuery
Bootstrap
Awesome Fonts
particles.Js

-------------------------------------

Challenges Experienced:

TMDB--It was very hard to find a free API that allowed us to search through celebrities and have an image in the JSON's returned object.

Google Authentication--We started with Facebook's and it was a major hassle.  We had a preference to start with Facebook because it is more likely to have a user image.  However getting the APIkey and understanding its documentation was a major problem.  This caused us to look into other solutions and we landed on google authentication which also has user images just not as likely.

Firebase/store/storage--Just during our presentation, firebase was returning an unforseen error.  Another challenge was deciding how to structure the data in the database to quickly access in our product.

CSS -- The only real problem was trying multiple "looks" and not feeling satisfied with anything to overly done.  We landed on a simple look that clearly displays on any device and is very responsive.

-----------------------------------

If we had more time we would like to go back and try and implement Facebook authentication as well as the ability to log off of either platform.

We would also like to prevent duplicate results as well as limit the number of records stored in our database for user's history.

We also want to have the ability to do a search of more than just celebrities.  Persons such as athletes or musicians.

It would be nice to work out the now known 3 invalid results that our API's have returned.  These include a timing out issue where on mobile with bad reception the Face++ gets unhappy with slow loading.  Face++ also is not friendly with files that are chosen that are "large".  Lastly we had a believedly Firebase issue that was seen during the presentation but we aren't fully sure what caused this issue.