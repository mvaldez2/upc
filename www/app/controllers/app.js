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
    function ($scope, $ionicModal, $ionicScrollDelegate, $sce, pageService, $firebaseObject,
      $firebaseAuth, $firebaseArray, $window, $state, $ionicHistory) {
      $scope.ready = true;

      var ref = firebase.database().ref();
      $scope.data = $firebaseArray(ref);



      //events database
      var eventsRef = ref.child("events");
      var events = $firebaseArray(eventsRef);
      $scope.places = $firebaseArray(ref.child('events'));
      var eventId = 0;

      $scope.submitEvent = function(name, city, street, number) {

        eventsRef.child(eventId).set({
          name: name,
          city: city,
          street: street,
          eventId: eventId,
          //create array off events and function to add events to user
        }, onComplete);
        eventId = eventId + 1;
      }

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


      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in
          console.log("Sign-in provider: " + user.providerId);
          console.log("  Provider-specific UID: " + user.uid);
          console.log("  Name: " + user.displayName);
          console.log("  Email: " + user.email);
          console.log("  Photo URL: " + user.photoURL);
        } else {
          console.log("No user")
        }
      });

      $scope.signOff = function () {
        $firebaseAuth().$signOut()

        .then(function() {
           console.log('Signout Succesfull')
           $state.go("dashboard")

        }, function(error) {
           console.log('Signout Failed')
        });
      }



      $ionicHistory.nextViewOptions({
        disableBack: true,
        disableAnimate: false,
        historyRoot: false,
        cache: false

      });





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
