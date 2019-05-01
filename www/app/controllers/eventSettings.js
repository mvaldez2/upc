/* global ionic, define */
define([
  'app',
  'services/event',
  'controllers/app'
], function (app) {
  'use strict';

  app.controller('EventSettingsCtrl', [
    '$scope',
    '$stateParams',
    '$window',
    '$ionicPopup',
    'eventService',
    '$firebaseArray',
    '$firebaseAuth',
    '$state',
    function ($scope, $stateParams, $window, $ionicPopup, eventService, $firebaseArray, $firebaseAuth, $state) {
      var ref = firebase.database().ref();
      var userRef = ref.child("googleUsers");
      var users = $firebaseArray(userRef);
      var eventsRef = ref.child("events");
      var events = $firebaseArray(eventsRef);
      var db = firebase.database();

      $scope.events = $firebaseArray(ref.child('events'));
      $scope.users = $firebaseArray(userRef);

      firebase.auth().onAuthStateChanged(function (user) {
        var userEventRef = ref.child("googleUsers/" + user.uid + "/events");
        var userEvents = $firebaseArray(userEventRef);
        $scope.userEvents = $firebaseArray(userEventRef);
        if (user) {
          var profileRef = firebase.database().ref('googleUsers/' + user.uid);
          profileRef.on('value', function (snapshot) {
            $scope.admin = snapshot.val().admin
            $scope.owner = snapshot.val().owner
          });
        }
      });

      $scope.sortEvents = function (event) {
        var date = - new Date(event.date);
        return date;
      };


      $scope.makeAdmin = function (id) {
        if ($scope.admin) {
          var popup = $ionicPopup.alert({
            title: 'Give Permission',
            template: 'Are you sure you want to give this user admin access?',
            buttons: [
              {
                text: '<b>OK</b>',
                onTap: function () {
                  db.ref("googleUsers/" + id + "/admin").set(true)
                }
              },
              {
                text: '<b>Cancel</b>',
                onTap: function () {

                  console.log('canceled');
                }
              }]
          });
        } else {
          console.log("Not permitted")
          $ionicPopup.alert({
            title: 'Access Denied',
            template: 'You need to be an Admin to do this.',
            buttons: [
              {
                text: '<b>OK</b>',
                onTap: function () {
                  console.log('shown');
                }
              }]
          });
        }

      }

      $scope.removeAdmin = function (id) {
        if ($scope.admin) {
          $ionicPopup.alert({
            title: 'Remove Admin Access',
            template: 'Are you sure you want to remove admin access?',
            buttons: [
              {
                text: '<b>OK</b>',
                onTap: function () {
                  db.ref("googleUsers/" + id + "/admin").set(false)
                }
              },
              {
                text: '<b>Cancel</b>',
                onTap: function () {

                  console.log('canceled');
                }
              }]
          });
        } else {
          console.log("Not permitted")
          $ionicPopup.alert({
            title: 'Access Denied',
            template: 'You need to be an Admin to do this.',
            buttons: [
              {
                text: '<b>OK</b>',
                onTap: function () {
                  console.log('shown');
                }
              }]
          });
        }


      }

      $scope.adminSite = function () {
        $window.open("https://dev-upc-app.firebaseapp.com", '_system');
      };


      $scope.deletingEvent = function (id) {
        firebase.auth().onAuthStateChanged(function (user) {
          if (ionic.Platform.isIOS() || ionic.Platform.is('android')) {
            console.log("Phone")
            ref.child("calendar/" + id).remove();
          } else {
            console.log("Web")
            ref.child("calendar/" + id).remove();
          }
        });
      }

      $scope.deleteEvent = function (id) {
        var confirmPopup = $ionicPopup.confirm({
          title: 'Delete Event',
          template: 'Are you sure you want to delete this event from the calendar?',
          cancelText: 'No',
          okText: 'Yes'
        });
        confirmPopup.then(function (res) {
          if (res) {
            $scope.deletingEvent(id);
          } else {
            $state.go("manageEvents");
          }
        });
      };

    }
  ]);
});
