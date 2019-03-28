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
    '$ionicPopover',
    function ($scope, $stateParams, $window, $ionicPopup, eventService, $firebaseArray, $ionicHistory, $timeout, $ionicPopover) {
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
        $scope.address = snapshot.val().address

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


      /* ------ Sets address for Google Maps ------ */

      $scope.currentAddress;

      $scope.setAddress = function() {
          var i =0;
          if (!$scope.location || $scope.location == "None") {  // Checks to see if there is a location or not
              $scope.location=undefined;
              return;
          }
          $scope.strLocation = $scope.location.split(" ");
          $scope.eventLocation = $scope.strLocation[0];
          switch ($scope.eventLocation) {                       // Puts address based on building or location
              case "Neils":
                $scope.currentAddress = "Neils Science Center, 1610 Campus Drive East, Valparaiso, IN";
                eventRef.update({
                  address: $scope.currentAddress
                });
                //add to address info to database
                break;
              case "West":
                $scope.currentAddress = undefined;
                break;
              case "Hearth":
              case "Cafe":
              case "Community":
              case "Ballrooms":
              case "Grand":
              case "Founders":
                $scope.currentAddress = "Harre Union, Chapel Drive, Valparaiso, IN";
                //add address to database
                break;
              default:
                $scope.currentAddress = $scope.location;
                break;

          }
          return $scope.currentAddress;
      };

      /* ------ Changes address ------ */
      $scope.alterAddress = function(location) {
          $scope.location = location;
          $scope.setAddress();
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
          $window.open('maps://?q=' + $scope.currentAddress, '_system');
        } else if (ionic.Platform.is('android')) {
          $window.open('geo://0,0?q=' + '(' + $scope.currentAddress + ')&z=15', '_system');

        } else {
          $window.open('https://www.google.com/maps/search/' + $scope.currentAddress);
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

      $scope.possibleLocations = ["Neils", "Hearth", "Community Room", "Cafe", "Ballrooms", "Grand Lobby", "West Lawn", "None"];

      var template = '<ion-popover-view><ion-header-bar> <h1 class="title">Choose a Location</h1> </ion-header-bar> <ion-content> Hello! </ion-content></ion-popover-view>';
      // .fromTemplate() method

      $scope.popover = $ionicPopover.fromTemplate(template, {
        scope: $scope
      });

      // .fromTemplateUrl() method
      $ionicPopover.fromTemplateUrl('my-popover.html', {
        scope: $scope
      }).then(function(popover) {
        $scope.popover = popover;
      });

      $scope.openPopover = function($event) {
        $scope.popover.show($event);
      };

      $scope.closePopover = function() {
        $scope.popover.hide();
      };

      //Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.popover.remove();
      });

      // Execute action on hidden popover
      $scope.$on('popover.hidden', function() {
        // Execute action
      });

      // Execute action on remove popover
      $scope.$on('popover.removed', function() {
        // Execute action
      });

    }
  ]);
});
