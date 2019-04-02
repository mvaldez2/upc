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
        var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
        var googleProfile = googleUser.getBasicProfile();
        var userId = googleUser.getId();
        var userEventRef = ref.child("googleUsers/" + userId + "/events");
        var userEvents = $firebaseArray(userEventRef);
        $scope.userEvents = $firebaseArray(userEventRef);
        $scope.userAdmin = ref.child("googleUsers/" + userId + "/admin");
        
      });


      $scope.showConfirm = function() {
          var confirmPopup = $ionicPopup.confirm({
              title: 'Log in to see your profile',
              template: 'Would you like to log in?',
              cancelText: 'No',
              okText: 'Yes'
          });
          confirmPopup.then(function(res) {
              if(res) {
                  $scope.login();
              } else {
                  $state.go("dashboard");
              }
          });
      };

      $scope.profSettings = function() {
          if ($scope.LoginTitle == "Log In") {
              console.log("Tried seeing profile without being logged in!!");
              $scope.showConfirm();
          } else {
              $state.go("profileSettings");
          }
      }







      //$state.go('dashboard');




    }
  ]);
});
