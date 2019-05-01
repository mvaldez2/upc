define([
  'app',
  'services/event'
], function (app) {
  'use strict';

  app.controller('DashboardCtrl', [
    '$scope',
    '$state',
    'eventService',
    '$firebaseArray',
    '$ionicPopup',

    function ($scope, $state, eventService, $firebaseArray, $ionicPopup) {

      var ref = firebase.database().ref();

      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          var userEventRef = ref.child("googleUsers/" + user.uid + "/events");
          var userEvents = $firebaseArray(userEventRef);
          $scope.userEvents = $firebaseArray(userEventRef);
          $scope.userAdmin = ref.child("googleUsers/" + user.uid + "/admin");
        }
      });


    }
  ]);
});
