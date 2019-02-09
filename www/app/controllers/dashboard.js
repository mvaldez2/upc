define([
  'app',
  'services/event'
], function (app) {
  'use strict';

  app.controller('DashboardCtrl', [
    '$scope',
    '$state',
    'eventService',
    '$ionicHistory',

    function ($scope, $state, eventService, $ionicHistory) {
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

      $ionicHistory.nextViewOptions({
        disableBack: true,
        disableAnimate: false,
        historyRoot: false,
        cache: false

      });

      $state.go('dashboard');




    }
  ]);
});
