/* global ionic, define */
define([
  'app',
  'controllers/app'
], function (app) {
  'use strict';

  app.controller('SigninCtrl', [
    '$scope',
    '$stateParams',
    '$window',
    '$ionicPopup',
    'eventService',
    '$firebaseArray',
    '$ionicHistory',
    'Calendar',
    '$state',
    '$cordovaCamera',
    function ($scope, $stateParams, $window, $ionicPopup, eventService, $firebaseArray, $ionicHistory, Calendar, $state, GooglePlus, $cordovaCamera) {
      var ref = firebase.database().ref();


      document.addEventListener("deviceready", function () {
        
      }, true);

      $scope.takePicture = function() {
        $cordovaCamera.getPicture(opts).then(function(p) {
        }, function(err) {
        });
    };

      var onComplete = function (error) {
        if (error) {
          console.log('Failed');
        } else {
          console.log('Completed');
        }
      };
      // ----------------- authentication for google calendar ------------------
      $scope.authenticate = function () {
        return gapi.auth2.getAuthInstance()
          .signIn({ scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar" })
          .then(function () { console.log("Sign-in successful"); },
            function (err) { console.error("Error signing in", err); });
      }
      $scope.loadClient = function () {
        return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest")
          .then(function () { console.log("GAPI client loaded for API"); },
            function (err) { console.error("Error loading GAPI client for API", err); });
      }


      //todays date for calendar sync
      var today = new Date();
      var day = today.getDate() + 1;
      var month = today.getMonth() + 1;
      var year = today.getFullYear();
      if (day < 10) {
        day = '0' + day;
      }
      if (month < 10) {
        month = '0' + month;
      }

      //---------------syncs calendar ---------
      var db = firebase.database();
      $scope.sync = function () {
        $scope.calendarEvents = gapi.client.calendar.events.list({
          "calendarId": "upc@valpo.edu",
          "maxResults": 20,
          "orderBy": "startTime",
          "singleEvents": true,
          "timeMin": year.toString() + "-" + month.toString() + "-" + day.toString() + "T00:00:00+10:00"
        })
          .then(function (response) {
            console.log("Response", response);
            $scope.upcEvents = response.result.items;
            db.ref().child('calendar').set({
              events: $scope.upcEvents
            });
          }, function (err) { console.error("Execute error", err); });


      }
      $scope.testSync = function () {
        $scope.calendarEvents = gapi.client.calendar.events.list({
          "calendarId": "miguel.valdez@valpo.edu",
          "maxResults": 20,
          "orderBy": "startTime",
          "singleEvents": true,
          "timeMin": year.toString() + "-" + month.toString() + "-" + day.toString() + "T00:00:00+10:00"
        })
          .then(function (response) {
            console.log("Response", response);
            $scope.upcEvents = response.result.items;
            db.ref().child('myCalendar').set({
              events: $scope.upcEvents
            });
          }, function (err) { console.error("Execute error", err); });


      }


      /*gapi.load("client:auth2", function () {
        gapi.auth2.init({ client_id: '188526661745-1qvjgbd02e62kjg1it4tj05p14rveb21.apps.googleusercontent.com' });
      });

      GAPI.init().then(function () {
      }, function () { console.log('Something went wrong yes?'); });*/


      var gUserRef = ref.child("googleUsers"); //get users
      var googleUsers = $firebaseArray(gUserRef);
      $scope.googleUsers = $firebaseArray(gUserRef);

      // ------------ signs in with authentication ---------------------------
      $scope.login = function () {
        $scope.LoggedIn = false;
        $scope.loadClient();
        gapi.auth2.getAuthInstance().signIn({ scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar" })
          .then(function () {
            console.log("Sign-in successful");
            $scope.LoggedIn = true;
            $scope.LoginTitle = "Log Out";
            console.log("LoginTitle =", $scope.LoginTitle);
            firebase.auth().onAuthStateChanged(function (user) {
              var googleUser = gapi.auth2.getAuthInstance().currentUser.get() //gets gppgle user
              $scope.isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get()
              var googleProfile = googleUser.getBasicProfile()
              $scope.googleProfile = googleUser.getBasicProfile()
              firebase.database().ref().child("googleUsers").orderByChild("email")
                .equalTo(googleProfile.getEmail()).on("value", function (snapshot) { //checks if user existis by checking if the email is in the db
                  if (snapshot.exists()) {  // account exists
                    console.log("exists");
                    console.log($scope.isSignedIn);

                  } else { //account deosn't exsist -> create new user
                    console.log("doesn't exist");
                    gUserRef.child(googleProfile.getId()).set({
                      name: googleProfile.getName(),
                      email: googleProfile.getEmail(),
                      photoUrl: googleProfile.getImageUrl(),
                      uid: googleProfile.getId(),
                      admin: false,
                      owner: false,
                    }, onComplete);
                  }
                });
            });
          }).then(function () {

            //sync calendar after sign in (should probably call it at a certian time of day and when event is added)
            $scope.sync();
            $state.go("profileSettings"); //go to dashboard after sign in
          });

      }

      //Firebase login alternative (probably the better option)
      $scope.login2 = function () {
        $scope.LoggedIn = false;
        $scope.loadClient();
        gapi.auth2.getAuthInstance({ scope: "https://www.googleapis.com/auth/calendar" }).signIn().then((res) => {
          $scope.LoggedIn = true;
          $scope.LoginTitle = "Log Out";
          console.log("LoginTitle =", $scope.LoginTitle)
          var token = res.getAuthResponse().id_token;
          var creds = firebase.auth.GoogleAuthProvider.credential(token);
          firebase.auth().signInWithCredential(creds).then((user) => {
            firebase.database().ref().child("googleUsers").orderByChild("email")
              .equalTo(user.email).on("value", function (snapshot) { //checks if user existis by checking if the email is in the db
                if (snapshot.exists()) {  // account exists
                  console.log("exists");


                } else { //account deosn't exsist -> create new user
                  console.log("doesn't exist");
                  gUserRef.child(user.uid).set({
                    name: user.displayName,
                    email: user.email,
                    photoUrl: user.photoURL,
                    emailVerified: user.emailVerified,
                    uid: user.uid,
                    admin: false,
                    owner: false,
                  }, onComplete);
                }
              });
            console.log(user)
          })
        }).then(function () {

          //sync calendar after sign in (should probably call it at a certian time of day and when event is added)
          $scope.sync();
          $state.go("profileSettings"); //go to dashboard after sign in
        });


      }

      $scope.login3 = function() {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider).then(function() {
          return firebase.auth().getRedirectResult();
        }).then(function(result) {
          // This gives you a Google Access Token.
          // You can use it to access the Google API.
          var token = result.credential.accessToken;
          var creds = firebase.auth.GoogleAuthProvider.credential(token);
          
          
          // The signed-in user info.
          var user = result.user;
          console.log(user)
          console.log(user.displayName)
          firebase.database().ref().child("googleUsers").orderByChild("email")
              .equalTo(user.email).on("value", function (snapshot) { //checks if user existis by checking if the email is in the db
                if (snapshot.exists()) {  // account exists
                  console.log("exists");


                } else { //account deosn't exsist -> create new user
                  console.log("doesn't exist");
                  gUserRef.child(user.uid).set({
                    name: user.displayName,
                    email: user.email,
                    photoUrl: user.photoURL,
                    emailVerified: user.emailVerified,
                    uid: user.uid,
                    admin: false,
                    owner: false,
                  }, onComplete);
                }
              });
          // ...
        }).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
        });
      }

      

      $scope.login4 = function() {
        GooglePlus.login(
          {
            'scopes': 'https://www.googleapis.com/auth/calendar', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
            'webClientId': '188526661745-1qvjgbd02e62kjg1it4tj05p14rveb21.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
            'offline': true // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
          },
          function (obj) {
            alert(JSON.stringify(obj)); // do something useful instead of alerting
            console.log(obj)
          },
          function (msg) {
            alert('error: ' + msg);
          }
        );
      }

      $ionicHistory.nextViewOptions({
        disableBack: true,
        disableAnimate: false,
        historyRoot: false,
        cache: false

      });
    }
  ]);
});
