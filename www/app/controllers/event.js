/* global ionic, define */
define([
  'app',
  'controllers/app'
], function (app) {
  'use strict';

  app.controller('EventCtrl', [
    '$scope',
    '$stateParams',
    '$window',
    '$ionicPopup',
    'eventService',
    '$firebaseArray',
    function ($scope, $stateParams, $window, $ionicPopup, eventService, $firebaseArray) {
       var ref = firebase.database().ref();
       var userRef = ref.child("users");
      var users = $firebaseArray(userRef);


      var eventsRef = ref.child("events");

      var events = $firebaseArray(eventsRef);
      $scope.events = $firebaseArray(ref.child('events'));
      $scope.users = $firebaseArray(userRef);



      var eventRef = firebase.database().ref('events/' + $stateParams.id);


      eventRef.on('value', function(snapshot) {
        console.log(snapshot.val());
        $scope.event = snapshot.val()
        $scope.eventId = snapshot.val().eventId
        $scope.name = snapshot.val().name
        $scope.city = snapshot.val().city
        $scope.street = snapshot.val().street
        $scope.image = snapshot.val().image
        $scope.room = snapshot.val().room
        $scope.lat = snapshot.val().lat
        $scope.lng = snapshot.val().lng

      });



      $scope.addEvent = function(){
        firebase.auth().onAuthStateChanged(function(user) {
          var userEventRef = ref.child("users");
          userEventRef.child(user.uid+"/events").set({
            event: $scope.event,
          });


        });


      }






      $scope.call = function () {
        $window.open('tel: 219.464.5415', '_system');
      };

      $scope.mail = function () {
        $window.open('mailto: upc@valpo.edu', '_system');
      };

      $scope.website = function () {
        $window.open("https://www.valpo.edu/university-programming-council/", '_system');
      };

      $scope.map = function () {
        if (ionic.Platform.isIOS()) {
          $window.open('maps://?q=' + $scope.lat + ',' + $scope.lng, '_system');
        } else {
          $window.open('geo://0,0?q=' + '(' + $scope.street + ' ' + $scope.city + ')&z=15', '_system');
        }
      };

      $scope.report = function () {
        $ionicPopup.prompt({
          scope: $scope,
          title: '<span class="energized">Report an issue</span>',
          subTitle: '<span class="stable">What\'s wrong or missing?</span>',
          inputType: 'text',
          inputPlaceholder: ''
        }).then(function (res) {
          if (res) {
            // here connect to backend and send report
          }
        });
      };
    }
  ]);
});
