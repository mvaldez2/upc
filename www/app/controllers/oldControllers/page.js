/* global ionic, define */
define([
  'app',
  'services/page'
], function (app) {
  'use strict';

  app.controller('InfoCtrl', [
    '$scope',
    '$stateParams',
    '$window',
    '$ionicPopup',
    'pageService',
    function ($scope, $stateParams, $window, $ionicPopup, pageService) {
      $scope.loading = true;
      pageService.getOne($stateParams.id).then(function (page) {
        $scope.page = page;
      }).finally(function () {
        $scope.loading = false;
      });

      $scope.reload = function () {
        pageService.getOne($stateParams.id).then(function (page) {
          $scope.page = page;
        }).finally(function () {
          $scope.$broadcast('scroll.refreshComplete');
        });
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
