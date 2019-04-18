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
        if (user){
          var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
          $scope.userId = googleUser.getId();
          var userEventRef = ref.child("googleUsers/" + user.uid + "/events");
          var userEvents = $firebaseArray(userEventRef);
          $scope.userEvents = $firebaseArray(userEventRef);
        }

      });

      var eventRef = firebase.database().ref('calendar/' + $stateParams.id);
      //get current event
      eventRef.on('value', function (snapshot) {
        console.log(snapshot.val());
        $scope.event = snapshot.val()
        $scope.summary = snapshot.val().summary
        $scope.location = snapshot.val().location
        //$scope.startDate = snapshot.val().start.dateTime
        //$scope.endDate = snapshot.val().end.dateTime
       // $scope.start = snapshot.val().start.date
        //$scope.end = snapshot.val().end.date
        $scope.id = snapshot.val().id

      });



      $scope.updateName = function (newName) {
        firebase.auth().onAuthStateChanged(function (user) {
          var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
          var userId = googleUser.getId();
          db.ref("googleUsers/" + user.uid + "/name").set(newName);
        });
      }

      /******** Delete Event *********/

      $scope.deletingEvent = function (id) {
        firebase.auth().onAuthStateChanged(function (user) {
          var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
          var userId = googleUser.getId();
          gapi.client.calendar.events.delete({
            "calendarId": user.email,
            "eventId": id
          })
            .then(function (response) {
              // Handle the results here (response.result has the parsed body).
              console.log("Response", response);
            },
              function (err) { console.error("Execute error", err); });

        
        ref.child("googleUsers/" + user.uid + "/events/" + id).remove();
      });
}

      // Delete Event Popup

      $scope.deleteEvent = function (id) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Delete Event',
      template: 'Are you sure you want to delete this event from your profile?',
      cancelText: 'No',
      okText: 'Yes'
    });
    confirmPopup.then(function (res) {
      if (res) {
        $scope.deletingEvent(id);
      } else {
        $state.go("profileSettings");
      }
    });
  };


$scope.deleteUser = function () {
  firebase.auth().onAuthStateChanged(function (user) {
    var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
    var userId = googleUser.getId();
    ref.child("googleUsers/" + userId).remove();
  });
  $state.go("dashboard");
}

firebase.auth().onAuthStateChanged(function (user) {
  if (user){
    var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
    var userId = googleUser.getId();

    // User is signed in
    var profileRef = firebase.database().ref('googleUsers/' + user.uid + '/');
    profileRef.on('value', function (snapshot) {
      console.log(snapshot.val())
      $scope.name = snapshot.val().name
      $scope.photoUrl = snapshot.val().photoUrl
      $scope.email = snapshot.val().email
      $scope.event = snapshot.val().events
      $scope.admin = snapshot.val().admin
    });
  }
});






    }
  ]);
});
