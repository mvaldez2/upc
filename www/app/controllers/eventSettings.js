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
      var userRef = ref.child("users");
      var users = $firebaseArray(userRef);
      var eventsRef = ref.child("events");
      var events = $firebaseArray(eventsRef);
      var db = firebase.database();

      $scope.events = $firebaseArray(ref.child('events'));
      $scope.users = $firebaseArray(userRef);

      var eventRef = firebase.database().ref('events/' + $stateParams.id);

      //get current user
      eventRef.on('value', function(snapshot) {
        console.log(snapshot.val());
        $scope.eventId = snapshot.val().eventId
      });

      function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 10; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
      }
      var eventId = makeid();

      firebase.auth().onAuthStateChanged(function(user) {
        var userEventRef = ref.child("users/"+ user.uid+ "/events");
        var userEvents = $firebaseArray(userEventRef);
        $scope.userEvents = $firebaseArray(userEventRef);
      });

      $scope.submitEventAdmin = function(name, city, street, room) {
        firebase.auth().onAuthStateChanged(function(user) {
          var profileRef = firebase.database().ref('users/' + user.uid);
          profileRef.on('value', function(snapshot) {
            $scope.admin = snapshot.val().admin
          });

          if ($scope.admin){
            eventsRef.child(eventId).set({
              name: name,
              city: city,
              street: street,
              room: room,
              eventId: eventId,
              image: 'https://maps.gstatic.com/tactile/pane/default_geocode-1x.png',
            })
            .catch(function(error) {
              console.log('Error');
            });
          } else {
            console.log("Not permitted")
            $ionicPopup.alert({
              title: 'Access Denied',
              template: 'You need to be an admin to do this.',
              buttons: [
              {
                 text: '<b>OK</b>',
                 onTap: function() {
                   console.log('shown');
                 }
               }]
            });
          }
          eventId = makeid();
        });
      }



      $scope.updateName = function(newName) {
        firebase.auth().onAuthStateChanged(function(user) {
          db.ref("events/"+ $scope.eventId + "/name").set(newName);
        });
      }

      $scope.deleteEvent = function(id) {
        firebase.auth().onAuthStateChanged(function(user) {
          var profileRef = firebase.database().ref('users/' + user.uid);
          profileRef.on('value', function(snapshot) {
            $scope.admin = snapshot.val().admin
          });

          if ($scope.admin){
            ref.child("events/"+ id).remove();
          } else {
            console.log("Not permitted")
            $ionicPopup.alert({
              title: 'Access Denied',
              template: 'You need to be an admin to do this.',
              buttons: [
              {
                 text: '<b>OK</b>',
                 onTap: function() {
                   console.log('shown');
                 }
               }]
            });
          }
        });
      }


      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in
          var profileRef = firebase.database().ref('users/'+ user.uid+'/');
          profileRef.on('value', function(snapshot) {
            console.log(snapshot.val().events)
            $scope.name = snapshot.val().name
            $scope.photoUrl = snapshot.val().photoUrl
            $scope.email = snapshot.val().email
            $scope.event = snapshot.val().events
          });
        } else {
          console.log("No user")
        }
      });






    }
  ]);
});
