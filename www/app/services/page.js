define([
  'app',
  'services/data'
], function (app) {
  'use strict';

  app.service('pageService', [
    '$q',
    '$timeout',
    'dataService',
    function ($q, $timeout, dataService) {
      this.get = function () {
        var deferred = $q.defer();

        $timeout(function () {
          deferred.resolve(angular.copy(dataService.pages));
        }, 1000);

        return deferred.promise;
      };

      this.getNext = function () {
        var deferred = $q.defer(),
            pages = [],
            i = 0;

        for (i; i < dataService.pages.length; i = i + 1) {
          if (i === 5) {
            break;
          }
          pages.push(dataService.pages[i]);
        }

        $timeout(function () {
          deferred.resolve(pages);
        }, 1000);

        return deferred.promise;
      };


      this.getOne = function (id) {
        var deferred = $q.defer(),
            page,
            i = 0;

        for (i; i < dataService.pages.length; i = i + 1) {
          if (dataService.pages[i].id.toString() === id.toString()) {
            page = angular.copy(dataService.pages[i]);
            break;
          }
        }

        
        $timeout(function () {
          if (page) {
            deferred.resolve(page);
          } else {
            deferred.reject();
          }
        }, 1000);

        return deferred.promise;
      };

    }
  ]);
});
