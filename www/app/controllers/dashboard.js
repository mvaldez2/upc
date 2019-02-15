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

    function ($scope, $state, eventService, $firebaseArray) {
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

      firebase.auth().onAuthStateChanged(function(user) {
        var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
        var googleProfile = googleUser.getBasicProfile();
        var userId = googleUser.getId();
        var userEventRef = ref.child("googleUsers/"+ userId+ "/events");
        var userEvents = $firebaseArray(userEventRef);
        $scope.userEvents = $firebaseArray(userEventRef);
        
      });



      $state.go('dashboard');




    }
  ]);
});
