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
      $scope.search = {};
      $scope.goToList = function () {
        $state.go('results', {
          search: $scope.search.string,
          satTrans: $scope.search.satTrans,
          wheelChair: $scope.search.wheelChair,
          wheelChairLift: $scope.search.wheelChairLift
        });
      };

      $scope.loadNext = function () {
        eventService.getNext().then(function (events) {
          $scope.events = events;
        });
      };
      var ref = firebase.database().ref();

      firebase.auth().onAuthStateChanged(function (user) {
        //var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
        // var googleProfile = googleUser.getBasicProfile();
        //var userId = googleUser.getId();
        if (user) {
          var userEventRef = ref.child("googleUsers/" + user.uid + "/events");
          var userEvents = $firebaseArray(userEventRef);
          $scope.userEvents = $firebaseArray(userEventRef);
          $scope.userAdmin = ref.child("googleUsers/" + user.uid + "/admin");
        }
      });










      //$state.go('dashboard');




    }
  ]);
});
