/* global ionic, define */
define([
  'app',
  'services/event',
  'controllers/app'
], function (app) {
  'use strict';

  app.controller('ProfileSettingsCtrl', [
    '$scope',
    '$stateParams',
    '$window',
    '$ionicPopup',
    'eventService',
    '$firebaseArray',
    '$firebaseAuth',
    '$state',
    function ($scope, $stateParams, $window, $ionicPopup, eventService, $firebaseArray, $firebaseAuth, $state) {
      var ref = firebase.database().ref();
      var userRef = ref.child("users");
      var users = $firebaseArray(userRef);
      var eventsRef = ref.child("events");
      var events = $firebaseArray(eventsRef);
      var db = firebase.database();

      $scope.events = $firebaseArray(ref.child('events'));
      $scope.users = $firebaseArray(userRef);


      firebase.auth().onAuthStateChanged(function(user) {
        var userEventRef = ref.child("users/"+ user.uid+ "/events");
        var userEvents = $firebaseArray(userEventRef);
        $scope.userEvents = $firebaseArray(userEventRef);
      });



      $scope.updateName = function(newName) {
        firebase.auth().onAuthStateChanged(function(user) {
          db.ref("users/"+ user.uid+ "/name").set(newName);
        });
      }

      $scope.deleteEvent = function(id) {
        firebase.auth().onAuthStateChanged(function(user) {
          ref.child("users/"+ user.uid + "/events/"+ id).remove();
        });
      }

      $scope.deleteUser = function() {
        firebase.auth().onAuthStateChanged(function(user) {
          ref.child("users/" + user.uid).remove();
        });
        $state.go("dashboard");
      }

      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in
          var profileRef = firebase.database().ref('users/'+ user.uid+'/');
          profileRef.on('value', function(snapshot) {
            console.log(snapshot.val().events)
            $scope.name = snapshot.val().name
            $scope.photoUrl = snapshot.val().photoUrl
            $scope.email = snapshot.val().email
            $scope.event = snapshot.val().events
          });
        } else {
          console.log("No user")
        }
      });





    }
  ]);
});
