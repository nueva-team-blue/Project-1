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