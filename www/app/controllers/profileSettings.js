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

      $scope.user = firebase.auth().currentUser;

      $scope.updateName = function(newName) {
        firebase.auth().onAuthStateChanged(function(user) {
          /*db.ref("users/" + user.uid ).update({name: newName}).then(function() {
           console.log("Updated name to: " + newName)

          }, function(error) {
             console.log('Error')
          });*/

          db.ref("users/"+ user.uid+ "/name").set(newName);


        });

      }



      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in
          var profileRef = firebase.database().ref('users/'+ user.uid+'/');
          profileRef.on('value', function(snapshot) {
            console.log(snapshot.val())
            $scope.name = snapshot.val().name
            $scope.photoUrl = snapshot.val().photoUrl
            $scope.email = snapshot.val().email
          });
        } else {
          console.log("No user")
        }
      });





    }
  ]);
});
