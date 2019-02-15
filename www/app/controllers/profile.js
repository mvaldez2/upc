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
      //gets users
      var userRef = ref.child("googleUsers");
      var users = $firebaseArray(userRef);
      $scope.users = $firebaseArray(userRef);

      //individual user info
      var profileRef = firebase.database().ref('googleUsers/' + $stateParams.id);
      profileRef.on('value', function(snapshot) {
        $scope.name = snapshot.val().name
        $scope.photoUrl = snapshot.val().photoUrl
        $scope.email = snapshot.val().email
        $scope.uid = snapshot.val().uid
      });

      var userEventRef = ref.child("googleUsers/"+ $stateParams.id + "/events");
      var userEvents = $firebaseArray(userEventRef);
      $scope.userEvents = $firebaseArray(userEventRef);





      $scope.call = function () {
        $window.open('tel:' + $scope.event.contact.tel, '_system');
      };

      $scope.mail = function () {
        $window.open('mailto:' + $scope.email, '_system');
      };

      $scope.website = function () {
        $window.open($scope.event.website, '_system');
      };

      $scope.map = function () {
        if (ionic.Platform.isIOS()) {
          $window.open('maps://?q=' + $scope.lat + ',' + $scope.lng, '_system');
        } else {
          $window.open('geo://0,0?q=' + $scope.lat + ',' + $scope.lng + '(' + $scope.name + '/' + $scope.city + ')&z=15', '_system');
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
