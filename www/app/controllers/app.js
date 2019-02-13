define([
  'app',
  'services/page'
], function (app) {
  'use strict';

  app.controller('AppCtrl', [
    '$scope',
    '$ionicModal',
    '$ionicScrollDelegate',
    '$sce',
    'pageService',
    '$firebaseObject',
    '$firebaseAuth',
    '$firebaseArray',
    '$window',
    '$state',
    '$ionicHistory',
    '$ionicPopup',
    'Calendar',
    'Youtube',
    'GAPI',
    function ($scope, $ionicModal, $ionicScrollDelegate, $sce, pageService, $firebaseObject,
      $firebaseAuth, $firebaseArray, $window, $state, $ionicHistory, $ionicPopup, Calendar, Youtube, GAPI) {
      $scope.ready = true;

      var ref = firebase.database().ref();
      $scope.data = $firebaseArray(ref);




      //events database
      var eventsRef = ref.child("events");
      var events = $firebaseArray(eventsRef);
      $scope.places = $firebaseArray(ref.child('events'));


      var onComplete = function(error) {
        if (error) {
            console.log('Failed');
        } else {
            console.log('Completed');
        }
      };


      //login
      var provider = new firebase.auth.GoogleAuthProvider();
      var userRef = ref.child("users");
      var users = $firebaseArray(userRef);
      $scope.users = $firebaseArray(ref.child('users'));



      $scope.login = function() {
        firebase.auth().signInWithPopup(provider).then(function(result) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;

          //check if user exists
          firebase.database().ref().child("users").orderByChild("email").equalTo(user.email).on("value", function(snapshot) {
            if (snapshot.exists()) {
                 console.log("exists");
            }else{ //if not create new user
                console.log("doesn't exist");
                userRef.child(user.uid).set({
                    name: user.displayName,
                    email: user.email,
                    photoUrl: user.photoURL,
                    emailVerified: user.emailVerified,
                    uid: user.uid,
                    token: token,
                    admin: false,

                    //create array off events and function to add events to user
                }, onComplete);
              }
            });

        }).then(function(authData) {
            $state.go("dashboard");
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
        });
    }




      $scope.signOff = function () {
        $firebaseAuth().$signOut()

        .then(function() {
           console.log('Signout Succesfull')
           $state.go("signIn")

        }, function(error) {
           console.log('Signout Failed')
        });
      }



      //disable back button
      /*$ionicHistory.nextViewOptions({
        disableBack: true,
        disableAnimate: false,
        historyRoot: true,
        cache: false

      });*/

      firebase.auth().onAuthStateChanged(function(user) {

        var userEventRef = ref.child("users/"+ user.uid+ "/events");
        var userEvents = $firebaseArray(userEventRef);
        $scope.userEvents = $firebaseArray(userEventRef);

      });

      $scope.shouldHide = function () {
        switch ($state.current.name) {
            case 'profile':
                return true;
            case 'event':
                return true;
            case 'profileSettings':
              return true;
            case 'eventSettings':
              return true;
            case 'about':
                return true;
            case 'perks':
              return true;
            case 'programs':
              return true;
            case 'calendar':
              return true;
            case 'signIn':
              return true;
            default:
                return false;
        }
    }





      //might be used for reload after submitting of something
      $scope.reloadRoute = function() {
        $window.location.reload();
      }





      $ionicModal.fromTemplateUrl('app/templates/page.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.modal = modal;
      });

      $scope.openModal = function (index) {
        var notEqual = index !== $scope.currentPage;
        if (notEqual) {
          $scope.opening = true;
          $scope.currentPage = index;
        }
        $scope.modal.show().then(function () {
          if (notEqual) {
            $ionicScrollDelegate.$getByHandle('modal').scrollTop();
          }
          $scope.opening = false;
        });
      };

      $scope.trustHtml = function (html) {
        return $sce.trustAsHtml(html);
      };

      $scope.closeModal = function () {
        $scope.modal.hide();
      };

      function onClientLoad(){
        gapi.client.load('calendar', 'v3', function(){
          console.log("Setting API key");
          gapi.client.setApiKey('AIzaSyBeXrlBrm8mZIV9KRrCXXOT90BfJ_drxRQ');
        });
      }

      $scope.authenticate = function() {
    return gapi.auth2.getAuthInstance()
        .signIn({scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.readonly"})
        .then(function() { console.log("Sign-in successful"); },
              function(err) { console.error("Error signing in", err); });
  }
  $scope.loadClient = function() {
    return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest")
        .then(function() { console.log("GAPI client loaded for API"); },
              function(err) { console.error("Error loading GAPI client for API", err); });
  }
  // Make sure the client is loaded and sign-in is complete before calling this method.
  $scope.execute = function() {
    $scope.cEvents =  gapi.client.calendar.events.list({
      "calendarId": "upc@valpo.edu",
      "maxResults": 20,
      "orderBy": "startTime",
      "singleEvents": true,
      "timeMin": "2019-02-02T00:00:00+10:00"
    })
        .then(function(response) {
                // Handle the results here (response.result has the parsed body).
                console.log("Response", response);
                $scope.response = response;
                console.log( $scope.response)
              },
              function(err) { console.error("Execute error", err); });

  }



  gapi.load("client:auth2", function() {
    gapi.auth2.init({client_id: '188526661745-1qvjgbd02e62kjg1it4tj05p14rveb21.apps.googleusercontent.com'});
  });


      GAPI.init()
  .then(function(){
    $scope.calendarEvents =  gapi.client.calendar.events.list({
      "calendarId": "upc@valpo.edu",
      "maxResults": 20,
      "orderBy": "startTime",
      "singleEvents": true,
      "timeMin": "2019-02-02T00:00:00+10:00"
    })
  }, function(){ console.log('Something went wrong yes?'); });

console.log( $scope.calendarEvents)



    }
  ]);
});

 //names database
      /*var namesRef = ref.child("names");
      var names = $firebaseArray(namesRef);
      $scope.words = $firebaseArray(ref.child('names'));

      $scope.submit = function(first_name, last_name) {
        names.$add({
         first_name: first_name,
         last_name: last_name
        }).then(function(ref) {
          var id = ref.key;
          console.log("added record with id " + id);
          names.$indexFor(id); // returns location in the array
        });
      }

      $scope.show = function(){
        names.$loaded()
          .then(function(){
            angular.forEach(names, function(name) {
              console.log(name);

          })
        });
      } */
