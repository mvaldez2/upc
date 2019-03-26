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
    '$timeout',
    function ($scope, $stateParams, $window, $ionicPopup, eventService, $firebaseArray, $ionicHistory, $timeout) {
      var ref = firebase.database().ref();
      var userRef = ref.child("googleUsers");
      var users = $firebaseArray(userRef);


      //get users
      $scope.users = $firebaseArray(userRef);
      var calRef = ref.child("calendar/events");
      var cal = $firebaseArray(calRef);
      $scope.cal = $firebaseArray(calRef);

      var eventRef = firebase.database().ref('calendar/events/' + $stateParams.id);
      //get current event
      eventRef.on('value', function (snapshot) {
        console.log(snapshot.val());
        $scope.event = snapshot.val()
        $scope.summary = snapshot.val().summary
        $scope.location = snapshot.val().location
        $scope.startDate = snapshot.val().start.dateTime
        $scope.endDate = snapshot.val().end.dateTime
        $scope.start = snapshot.val().start.date
        $scope.end = snapshot.val().end.date
        $scope.id = snapshot.val().id

      });


      firebase.auth().onAuthStateChanged(function (user) {
        var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
        var userId = googleUser.getId();
        var userEventRef = ref.child("googleUsers/" + userId + "/events/"+ $stateParams.id);
        //get current user event
        userEventRef.on('value', function (snapshot) {
          console.log(snapshot.val());
          $scope.uEvent = snapshot.val()
          $scope.uSummary = snapshot.val().event.summary
          $scope.uLocation = snapshot.val().event.location
          $scope.uStartDate = snapshot.val().event.start.dateTime
          $scope.uEndDate = snapshot.val().event.end.dateTime
          $scope.uStart = snapshot.val().event.start.date
          $scope.uEnd = snapshot.val().event.end.date


        });
      });


      //format dates
      var date = new Date($scope.startDate);
      var dayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      var timeOptions = { hour: 'numeric', minute: 'numeric' };
      $scope.formatedDay = date.toLocaleDateString("en-US", dayOptions);
      var time = date.toLocaleDateString("en-US", timeOptions);
      try {
        $scope.formatedTime = new Intl.DateTimeFormat("en-US", timeOptions).format(date);
      } catch (e) {
        date = new Date($scope.start);
        var dateEnd = new Date($scope.end);
        var dayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        $scope.formatedDay = date.toLocaleDateString("en-US", dayOptions);
        $scope.dateEnd = dateEnd.toLocaleDateString("en-US", dayOptions);

      }

      $scope.showLogInAlert = function() {
          var alertPopup = $ionicPopup.alert({
              title: 'Log In',
              template: 'You need to be logged in to add an event!'
          });
      }

      $scope.showEventAddedAleart = function() {
          var alertPopup = $ionicPopup.alert({
              title: 'Event Added',
              template: 'An event has been added to your profile and your Google Calendar. Find your events under your profile.'
          });
      }


      // fix date for calendar insert


      //add event to user
      $scope.addEvent = function () {
        if ($scope.LoginTitle == "Log In") {
            console.log("Can't add an event without being logged in!");
            $scope.showLogInAlert();
            return;
        }
        firebase.auth().onAuthStateChanged(function (user) {
          var googleUser = gapi.auth2.getAuthInstance().currentUser.get();
          var googleProfile = googleUser.getBasicProfile();
          var userId = googleUser.getId();
          $scope.userId = googleUser.getId();

          if ($scope.startDate == undefined) {
            gapi.client.calendar.events.insert({
              "calendarId": googleProfile.getEmail(),
              "resource": {
                "end": {
                  "date": $scope.end
                },
                "start": {
                  "date": $scope.start
                },
                "location": $scope.location,
                "summary": $scope.summary
              }
            })
              .then(function (response) {
                // Handle the results here (response.result has the parsed body).
                console.log("Response", response);
              },
                function (err) { console.error("Execute error", err); });
          } else {
            gapi.client.calendar.events.insert({
              "calendarId": googleProfile.getEmail(),
              "resource": {
                "end": {
                  "dateTime": $scope.endDate
                },
                "start": {
                  "dateTime": $scope.startDate
                },
                "location": $scope.location,
                "summary": $scope.summary
              }
            })
              .then(function (response) {
                // Handle the results here (response.result has the parsed body).
                console.log("Response", response);
              },
                function (err) { console.error("Execute error", err); });
          }

          var userEventRef = ref.child("googleUsers/" + userId + "/events");

          userEventRef.child($stateParams.id).set({
            event: $scope.event,

          }).then(function () {
            console.log('Event ' + $scope.summary + ' added')
            $scope.showEventAddedAleart();


          }, function (error) {
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
          $window.open('maps://?q=' + $scope.location, '_system');
        } else if (ionic.Platform.is('android')) {
          $window.open('geo://0,0?q=' + '(' + $scope.location + ')&z=15', '_system');

        } else {
          $window.open('https://www.google.com/maps/search/' + $scope.location);
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

      $scope.aboutText = "Well, look no further than University Programming Council! UPC is the Chicago bus trip leading, laughter inducing, Homecoming orchestrating, leadership inspiring, Valpo After Dark hosting, festival conducting, movie projecting, concert coordinating, Midnight Brunch managing, inexhaustible and irrepressible source of a good time on the Valparaiso University campus! We put together over 80 events each year!"


      $scope.alterAboutText = function() {
          $ionicPopup.prompt({
            title: 'Edit About Text',
            template: 'Current text:' + $scope.aboutText,
            inputType: 'text'
        })
        .then(function(result) {
            if (result == undefined || result == '') {
                console.log("About text not changed")
            }
            else {
                $scope.aboutText = result;
            }

        }); 
      }
    }
  ]);
});
