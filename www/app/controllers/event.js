/* global ionic, define */
define([
  'app',
  'controllers/app'
], function (app) {
  'use strict';

  app.controller('EventCtrl', [
    '$scope',
    '$stateParams',
    '$window',
    '$ionicPopup',
    'eventService',
    '$firebaseArray',
    '$ionicHistory',
    function ($scope, $stateParams, $window, $ionicPopup, eventService, $firebaseArray, $ionicHistory) {
       var ref = firebase.database().ref();
       var userRef = ref.child("googleUsers");
      var users = $firebaseArray(userRef);


      var eventsRef = ref.child("events");

      var events = $firebaseArray(eventsRef);
      $scope.events = $firebaseArray(ref.child('events'));
      $scope.users = $firebaseArray(userRef);
      var calRef = ref.child("calendar/events");
      var cal = $firebaseArray(calRef);
      $scope.cal = $firebaseArray(calRef);



      var eventRef = firebase.database().ref('calendar/events/' + $stateParams.id);


      //get current event
      eventRef.on('value', function(snapshot) {
        console.log(snapshot.val());
        $scope.event = snapshot.val()
        $scope.summary = snapshot.val().summary
        $scope.location = snapshot.val().location
        $scope.date = snapshot.val().start.dateTime
        $scope.dateStart =  snapshot.val().start.date
        $scope.dateEnd =  snapshot.val().end.date

      });


      var date = new Date($scope.date);
      var dayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      var timeOptions = { hour: 'numeric', minute: 'numeric' };
      $scope.formatedDay = date.toLocaleDateString("en-US", dayOptions);


      var time = date.toLocaleDateString("en-US", timeOptions);
      try {
        $scope.formatedTime = new Intl.DateTimeFormat("en-US", timeOptions).format(date);
      } catch(e) {
        date = new Date($scope.dateStart);
        var dateEnd = new Date($scope.dateEnd);
        var dayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        $scope.formatedDay = date.toLocaleDateString("en-US", dayOptions);
        $scope.dateEnd = dateEnd.toLocaleDateString("en-US", dayOptions);

      }


      //add event to user
      $scope.addEvent = function(){
        firebase.auth().onAuthStateChanged(function(user) {
          var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
          var userId = googleUser.getId();

          var userEventRef = ref.child("googleUsers/"+ userId + "/events");



          userEventRef.child($stateParams.id).set({
            summary: $scope.summary,

          }).then(function() {
             console.log('Event '+ $scope.summary +  ' added')

          }, function(error) {
             console.log(error)
          });

        });


      }







      $scope.call = function () {
        $window.open('tel: 219.464.5415', '_system');
      };

      $scope.mail = function () {
        $window.open('mailto: upc@valpo.edu', '_system');
      };

      $scope.website = function () {
        $window.open("https://www.valpo.edu/university-programming-council/", '_system');
      };

      $scope.map = function () {
        if (ionic.Platform.isIOS()) {
          //$window.open('maps://?q=' + $scope.lat + ',' + $scope.lng, '_system');
          $window.open('maps://?q=' + $scope.location , '_system');
        } else if (ionic.Platform.is('android')) {
          $window.open('geo://0,0?q=' + '(' + $scope.location  + ')&z=15', '_system');

        } else {
          $window.open('https://www.google.com/maps/search/'+ $scope.location );
        }
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
