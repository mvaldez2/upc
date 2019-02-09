/* global ionic, define */
define([
  'app',
  'services/event',
  'controllers/app'
], function (app) {
  'use strict';

  app.controller('ProfileCtrl', [
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


      var profileRef = firebase.database().ref('users/' + $stateParams.id);
      
      
      profileRef.on('value', function(snapshot) {
        console.log(snapshot.val());
        $scope.name = snapshot.val().name
        $scope.photoUrl = snapshot.val().photoUrl
        $scope.email = snapshot.val().email
      });

      


     

      $scope.call = function () {
        $window.open('tel:' + $scope.event.contact.tel, '_system');
      };

      $scope.mail = function () {
        $window.open('mailto:' + $scope.event.contact.email, '_system');
      };

      $scope.website = function () {
        $window.open($scope.event.website, '_system');
      };

      $scope.map = function () {
        if (ionic.Platform.isIOS()) {
          $window.open('maps://?q=' + $scope.event.lat + ',' + $scope.event.lng, '_system');
        } else {
          $window.open('geo://0,0?q=' + $scope.event.lat + ',' + $scope.event.lng + '(' + $scope.event.name + '/' + $scope.event.city + ')&z=15', '_system');
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
