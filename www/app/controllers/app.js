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
    function ($scope, $ionicModal, $ionicScrollDelegate, $sce, pageService, $firebaseObject, $firebaseAuth, $firebaseArray, $window) {
      $scope.ready = true;

      var ref = firebase.database().ref();
      $scope.data = $firebaseArray(ref);

      //names database
      var namesRef = ref.child("names");
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
      }

      //events database
      var eventsRef = ref.child("events");
      var events = $firebaseArray(eventsRef);
      $scope.places = $firebaseArray(ref.child('events'));

      $scope.submitEvent = function(name, city, street) {
        events.$add({
         name: name,
         city: city,
         street: street
        }).then(function(ref) {
          var id = ref.key;
          console.log("added record with id " + id);
          names.$indexFor(id); // returns location in the array
        });
      }


            
      //login
      var provider = new firebase.auth.GoogleAuthProvider();
      var userRef = ref.child("users");
      var users = $firebaseArray(userRef);
      $scope.users = $firebaseArray(ref.child('users'));

      var onComplete = function(error) {
        if (error) {
            console.log('Failed');
        } else {
            console.log('Completed');
        }
    };


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
                    token: token
                    //create array off events and function to add events to user
                }, onComplete);
              }
            });
          
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
           
        }, function(error) {
           console.log('Signout Failed')  
        });
      }


      var db = firebase.database();

      //test update function
      $scope.updateName = function(newName) {
        firebase.auth().onAuthStateChanged(function(user) {  
          db.ref("users/" + user.uid ).update({name: newName}).then(function() {
           console.log("Updated name to: " + newName)
           
        }, function(error) {
           console.log('Error')  
        });
          
      });  
      }

      //might be used for reload after submitting of something
      $scope.reloadRoute = function() {
        $window.location.reload();
      }




      pageService.get().then(function (pages) {
        $scope.pages = pages;
      });

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
