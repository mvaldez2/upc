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
        var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
        var userId = googleUser.getId();
        var userEventRef = ref.child("googleUsers/"+ userId+ "/events");
        var userEvents = $firebaseArray(userEventRef);
        $scope.userEvents = $firebaseArray(userEventRef);
        var profileRef = firebase.database().ref('googleUsers/' + userId);
        profileRef.on('value', function(snapshot) {
          $scope.admin = snapshot.val().admin
          $scope.owner = snapshot.val().owner
          });
        });



      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1; //January is 0!
      var yyyy = today.getFullYear();
      if (dd < 10) {
        dd = '0' + dd;
      }
      if (mm < 10) {
        mm = '0' + mm;
      }
      today = mm + '/' + dd + '/' + yyyy;




      $scope.submitEventAdmin = function(name, city, street, room, date, time) {
        firebase.auth().onAuthStateChanged(function(user) {
          var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
          var userId = googleUser.getId();
          var profileRef = firebase.database().ref('googleUsers/' + userId);
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
              date: date,
              time: time,
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


      $scope.sortEvents = function(event) {
        var date = - new Date(event.date);
        return date;
      };


      $scope.updateName = function(newName) {
        firebase.auth().onAuthStateChanged(function(user) {
          db.ref("events/"+ $scope.eventId + "/name").set(newName);
        });
      }

      $scope.deleteEvent = function(id) {
        firebase.auth().onAuthStateChanged(function(user) {
          var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
          var userId = googleUser.getId();
          var profileRef = firebase.database().ref('googleUsers/' + userId);
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






      $scope.makeAdmin = function(id) {
        $ionicPopup.alert({
          title: 'Give Permission',
          template: 'Are you sure you want to give this user admin access?',
          buttons: [
          {
             text: '<b>OK</b>',
             onTap:  function(){
               db.ref("googleUsers/"+ id+ "/admin").set(true)
             }
           },
           {
              text: '<b>Cancel</b>',
              onTap:  function(){

                console.log('canceled');
              }
            }]
        });

      }

      $scope.removeAdmin = function(id) {
        if ($scope.owner){
          $ionicPopup.alert({
            title: 'Remove Admin Access',
            template: 'Are you sure you want to remove admin access?',
            buttons: [
            {
               text: '<b>OK</b>',
               onTap:  function(){
                 db.ref("googleUsers/"+ id+ "/admin").set(false)
               }
             },
             {
                text: '<b>Cancel</b>',
                onTap:  function(){

                  console.log('canceled');
                }
              }]
          });
        } else {
          console.log("Not permitted")
          $ionicPopup.alert({
            title: 'Access Denied',
            template: 'You need to be an Owner to do this.',
            buttons: [
            {
               text: '<b>OK</b>',
               onTap: function() {
                 console.log('shown');
               }
             }]
          });
        }


      }








    }
  ]);
});
