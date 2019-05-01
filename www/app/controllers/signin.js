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
    'GAPI',
    '$state',
    function ($scope, $stateParams, $window, $ionicPopup, eventService, $firebaseArray, $ionicHistory, Calendar, GAPI, $state) {
      var ref = firebase.database().ref();

      $scope.user;

      document.addEventListener("deviceready", function () {

      }, true);

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
      var day = today.getDate();
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
      var eventRef = ref.child("events");
      var calendarRef = ref.child("calendar");

      $scope.sync2 = function () {
        $scope.calendarEvents = gapi.client.calendar.events.list({
          "calendarId": "upc@valpo.edu",
          "maxResults": 15,
          "orderBy": "startTime",
          "singleEvents": true,
          "timeMin": year.toString() + "-" + month.toString() + "-" + day.toString() + "T00:00:00+10:00"
        })
          .then(function (response) {
            $scope.upcEvents = response.result.items;
            var events = response.result.items
            for (var i in $scope.upcEvents) {
              firebase.database().ref().child("calendar").orderByChild("id")
                .equalTo($scope.upcEvents[i].id).on("value", function (snapshot) {
                  if (snapshot.exists()) {
                    console.log("already added: ", $scope.upcEvents[i].summary)
                  } else {
                    console.log("event added: ", $scope.upcEvents[i].summary)
                    if ($scope.upcEvents[i].location == undefined) {
                      calendarRef.child($scope.upcEvents[i].id).set({
                        created: $scope.upcEvents[i].created,
                        creator: $scope.upcEvents[i].creator,
                        end: $scope.upcEvents[i].end,
                        etag: $scope.upcEvents[i].etag,
                        htmlLink: $scope.upcEvents[i].htmlLink,
                        iCalUID: $scope.upcEvents[i].iCalUID,
                        id: $scope.upcEvents[i].id,
                        kind: $scope.upcEvents[i].kind,
                        location: "No location specified",
                        address: "",
                        organizer: $scope.upcEvents[i].organizer,
                        reminders: $scope.upcEvents[i].reminders,
                        start: $scope.upcEvents[i].start,
                        status: $scope.upcEvents[i].status,
                        summary: $scope.upcEvents[i].summary,
                        updated: $scope.upcEvents[i].updated
                      });
                    } else {
                      calendarRef.child($scope.upcEvents[i].id).set({
                        created: $scope.upcEvents[i].created,
                        creator: $scope.upcEvents[i].creator,
                        end: $scope.upcEvents[i].end,
                        etag: $scope.upcEvents[i].etag,
                        htmlLink: $scope.upcEvents[i].htmlLink,
                        iCalUID: $scope.upcEvents[i].iCalUID,
                        id: $scope.upcEvents[i].id,
                        kind: $scope.upcEvents[i].kind,
                        location: $scope.upcEvents[i].location,
                        address: "",
                        organizer: $scope.upcEvents[i].organizer,
                        reminders: $scope.upcEvents[i].reminders,
                        start: $scope.upcEvents[i].start,
                        status: $scope.upcEvents[i].status,
                        summary: $scope.upcEvents[i].summary,
                        updated: $scope.upcEvents[i].updated
                      });
                    }
                  }
                });
            }


          }, function (err) { console.error("Execute error", err); });
      }


      gapi.load("client:auth2", function () {
        gapi.auth2.init({ client_id: '188526661745-1qvjgbd02e62kjg1it4tj05p14rveb21.apps.googleusercontent.com' });
      });

      GAPI.init().then(function () {
      }, function () { console.log('Something went wrong yes?'); });


      var gUserRef = ref.child("googleUsers"); //get users
      var googleUsers = $firebaseArray(gUserRef);
      $scope.googleUsers = $firebaseArray(gUserRef);

      // ------------ signs in with authentication ---------------------------

      //Firebase login alternative (probably the better option)
      $scope.login2 = function () {
        $scope.loadClient();
        gapi.auth2.getAuthInstance({ scope: "https://www.googleapis.com/auth/calendar" }).signIn().then((res) => {
          console.log("LoginTitle =", $scope.LoginTitle)
          var token = res.getAuthResponse().id_token;
          var creds = firebase.auth.GoogleAuthProvider.credential(token);
          firebase.auth().signInWithCredential(creds).then((user) => {
            console.log(user);
            $scope.LoginTitle = "Log Out";
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
          $scope.sync2();

        });

      }

      // Android Login
      $scope.login3 = function () {
        $scope.LoggedIn = false;
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider).then(function () {
          return firebase.auth().getRedirectResult();
        }).then(function (result) {
          $scope.LoggedIn = true;
          $scope.LoginTitle = "Log Out";
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
        }).catch(function (error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
        });
      }

      $scope.signIn = function () {
        if (document.URL.startsWith('http')) {
          console.log("Web 1")
          $scope.login2();
        } else if (ionic.Platform.isIOS() || ionic.Platform.is('android')) {
          console.log("Phone")
          $scope.login3();

        } else {
          console.log("Web")
          $scope.login2();
        }
      }

      $scope.signOff = function () {
        firebase.auth().signOut()

          .then(function () {
            console.log('Signout Succesfull')
            $scope.LoggedIn = false;
            $scope.LoginTitle = "Log In"
            $state.go("dashboard")

          }, function (error) {
            console.log('Signout Failed')
          });
      }

      // ---------- Switch login/ logout buttons --------------
      if (document.URL.startsWith('http')) {
        $scope.LoginTitle = "Log In";

      } else if (ionic.Platform.isIOS() || ionic.Platform.is('android')) {
        firebase.auth().onAuthStateChanged(function (user) {
          if (user) {
            $scope.LoginTitle = "Log Out"
          } else {
            $scope.LoginTitle = "Log In";
          }
        });

      } else {
        $scope.LoginTitle = "Log In";

      }

      $scope.clicked2 = function () {
        if ($scope.LoginTitle == "Log In") {
          $scope.signIn();
        } else {
          $scope.signOff();
        }
      }

      $scope.showConfirm = function () {
        var confirmPopup = $ionicPopup.confirm({
          title: 'Log in to see your profile',
          template: 'Would you like to log in?',
          cancelText: 'No',
          okText: 'Yes',
          okType: "button-energized",
          cancelType: "button-energized"
        });
        confirmPopup.then(function (res) {
          if (res) {
            $scope.signIn();
          } else {
            $state.go("dashboard");
          }
        });
      };

      //stop it from being called again
      $scope.profSettings = function () {
        firebase.auth().onAuthStateChanged(function (user) {
          if (user) {
            $state.go("profileSettings");
          } else {
            console.log("Tried seeing profile without being logged in!!");
            $scope.showConfirm();
          }
        });

      }

      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          // User is signed in
          var profileRef = firebase.database().ref('googleUsers/' + user.uid + '/');
          profileRef.on('value', function (snapshot) {
            console.log(snapshot.val())
            $scope.name = snapshot.val().name
            $scope.photoUrl = snapshot.val().photoUrl
            $scope.email = snapshot.val().email
            $scope.event = snapshot.val().events
            $scope.admin = snapshot.val().admin
            $scope.owner = snapshot.val().owner
          });
        } else {
          $scope.LoginTitle = "Log In";
          $scope.admin = false
          $scope.owner = false

        }
      });

    }
  ]);
});
