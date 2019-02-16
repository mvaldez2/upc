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
    '$timeout',
    function ($scope, $stateParams, $window, $ionicPopup, eventService, $firebaseArray, $firebaseAuth, $state, $timeout) {
      var ref = firebase.database().ref();
      var userRef = ref.child("googleUsers");
      var users = $firebaseArray(userRef);
      var eventsRef = ref.child("events");
      var events = $firebaseArray(eventsRef);
      var db = firebase.database();

      $scope.events = $firebaseArray(ref.child('events'));
      $scope.users = $firebaseArray(userRef);


      firebase.auth().onAuthStateChanged(function (user) {
        var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
        $scope.userId = googleUser.getId();
        var userEventRef = ref.child("googleUsers/" + $scope.userId + "/events");
        var userEvents = $firebaseArray(userEventRef);
        $scope.userEvents = $firebaseArray(userEventRef);


      });



      $scope.updateName = function (newName) {
        firebase.auth().onAuthStateChanged(function (user) {
          var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
          var userId = googleUser.getId();
          db.ref("googleUsers/" + userId + "/name").set(newName);
        });
      }

      $scope.deleteEvent = function (id) {
        firebase.auth().onAuthStateChanged(function (user) {
          var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
          var userId = googleUser.getId();
          ref.child("googleUsers/" + userId + "/events/" + id).remove();
        });
        var popup = $ionicPopup.show({
          title: 'Event Deleted!',
        });

        $timeout(function () {
          popup.close(); //close the popup after 3 seconds for some reason
        }, 300);
      }

      $scope.deleteUser = function () {
        firebase.auth().onAuthStateChanged(function (user) {
          var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
          var userId = googleUser.getId();
          ref.child("googleUsers/" + userId).remove();
        });
        $state.go("dashboard");
      }

      firebase.auth().onAuthStateChanged(function (user) {
        var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
        var userId = googleUser.getId();
        // User is signed in
        var profileRef = firebase.database().ref('googleUsers/' + userId + '/');
        profileRef.on('value', function (snapshot) {
          console.log(snapshot.val())
          $scope.name = snapshot.val().name
          $scope.photoUrl = snapshot.val().photoUrl
          $scope.email = snapshot.val().email
          $scope.event = snapshot.val().events
        });

      });






    }
  ]);
});
