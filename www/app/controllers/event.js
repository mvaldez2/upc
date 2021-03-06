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
      var calRef = ref.child("calendar");
      var cal = $firebaseArray(calRef);
      $scope.cal = $firebaseArray(calRef);

      var eventRef = firebase.database().ref('calendar/' + $stateParams.id);

      //get current event
      eventRef.on('value', function (snapshot) {
        $scope.event = snapshot.val()
        $scope.summary = snapshot.val().summary
        $scope.location = snapshot.val().location
        $scope.startDate = snapshot.val().start.dateTime
        $scope.endDate = snapshot.val().end.dateTime
        $scope.start = snapshot.val().start.date
        $scope.end = snapshot.val().end.date
        $scope.id = snapshot.val().id
        $scope.address = snapshot.val().address
        console.log("event:", $scope.event)
      });

      firebase.database().ref().child("calendar/").orderByChild("id").on("value", function (snapshot) {
        var recent = Infinity;
        var recentEvent = "";
        var date = new Date();
        date.setDate(date.getDate());

        snapshot.forEach((child) => {
          var start = new Date(child.val().start.dateTime);
          start.setHours(start.getHours() + 1)
          if (start > date && (start < new Date(recent) || start < recent)) {
            recent = start;
            recentEvent = child.val();
          }


        });
        $scope.recentEvent = recentEvent
        console.log(recentEvent.address)

      });

      //  MOVE TO APP.JS AND APPLY TO ALL EVENTS sometime
      $scope.formatDate = function (eventDate) {

        var date = new Date(eventDate);
        var dayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        var finalDate = date.toLocaleDateString("en-US", dayOptions);
        if (finalDate == 'Invalid Date') {
          date = new Date($scope.start);
          var end = new Date($scope.end);
          var dayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
          var startDate = date.toLocaleDateString("en-US", dayOptions);
          var endDate = end.toLocaleDateString("en-US", dayOptions);
          finalDate = startDate; // for multiple days: finalDate = startDate + " - " + endDate; This messes with the order of the events

        }
        return finalDate;

      }

      //format dates MOVE TO APP.JS AND APPLY TO ALL EVENTS sometime
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

      // ----------- Alerts ----------- //

      $scope.showLogInAlert = function () {
        var alertPopup = $ionicPopup.alert({
          title: 'Log In',
          template: 'You need to be logged in to do this!'
        });
      }

      $scope.showEventAddedAleart = function () {
        var alertPopup = $ionicPopup.alert({
          title: 'Event Added',
          template: 'An event has been added to your profile.'
        });
      }

      $scope.alreadyAddedAlert = function () {
        var alertPopup = $ionicPopup.alert({
          title: 'Event Already Added',
          template: 'You have this event added.'
        });
      }

      $scope.showEventCheckInAlert = function () {
        var alertPopups = $ionicPopup.alert({
          title: 'Event Checked in',
          template: 'You have checked in to this event. It has been counted towards your Crusader Perks!'
        });
      }

      //Display Check-in Button
      $scope.showCheckIn = function () {
        var dateTimeStart = new Date($scope.startDate);
        var timeStart = dateTimeStart.getTime();

        var dateTimeEnd = new Date($scope.endDate);
        var timeEnd = dateTimeEnd.getTime();

        var dateNow = new Date();
        var nowTime = dateNow.getTime();

        if (nowTime > timeStart && nowTime < timeEnd) {

          return true;

        }
        else {
          return false;
        }
      }

      //Display Check-in Button for upcoming event
      $scope.showCheckInUpcoming = function () {
        var dateTimeStart = new Date($scope.recentEvent.start.dateTime);
        var timeStart = dateTimeStart.getTime();

        var dateTimeEnd = new Date($scope.recentEvent.end.dateTime);
        var timeEnd = dateTimeEnd.getTime();

        var dateNow = new Date();
        var nowTime = dateNow.getTime();

        if (nowTime > timeStart && nowTime < timeEnd) {
          return true;

        }
        else {
          return false;
        }
      }

      // ----------- Runs whenever a user logs in or out
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          $scope.loggedIn = true;
          $scope.addingEvent = false;
          $scope.checkingIn = false;
          $scope.onlineUser = user;
          console.log("Logged In")
          // User is signed in
        } else {
          console.log("Logged out");
          $scope.loggedIn = false;
          $scope.addingEvent = false;
          $scope.checkingIn = false;
          $scope.admin = false
          $scope.owner = false
        }
      });

      // ----------- 'Add' button functions ----------- //

      // ----------- Checks to see if user already has added the event
      $scope.checkEvent = function (event) {
        firebase.auth().onAuthStateChanged(function (user) {
          if ($scope.loggedIn) {
            firebase.database().ref().child("googleUsers/" + user.uid + "/events").orderByChild("id")
              .equalTo(event.id).on("value", function (snapshot) {
                if (snapshot.exists()) {
                  $scope.eventAdded = true
                } else {
                  $scope.eventAdded = false
                }
              });
          }
        });
        return $scope.eventAdded
      }

      // ----------- Inserts data
      $scope.addEventDb = function (event) {
        firebase.auth().onAuthStateChanged(function (user) {
          var userEventRef = ref.child("googleUsers/" + user.uid + "/events");
          userEventRef.child(event.id).set({
            created: event.created,
            creator: event.creator,
            end: event.end,
            etag: event.etag,
            htmlLink: event.htmlLink,
            iCalUID: event.iCalUID,
            id: event.id,
            kind: event.kind,
            location: event.location,
            organizer: event.organizer,
            reminders: event.reminders,
            start: event.start,
            status: event.status,
            summary: event.summary,
            updated: event.updated
          }).then(function () {
            console.log('Event ' + $scope.summary + ' added')
          }, function (error) {
            console.log(error)
          });
        });
      }

      // ----------- Adds the event to the users database
      //add event to user
      $scope.addingEvent = false;
      $scope.addEvent = function (event) {
        $scope.addingEvent = true;
        firebase.auth().onAuthStateChanged(function (user) {
          console.log("loggedIn =", $scope.loggedIn);
          console.log("addingEvent =", $scope.addingEvent);
          if (!$scope.loggedIn && $scope.addingEvent) {
            console.log("Can't add an event without being logged in!");
            $scope.showLogInAlert();
            $scope.addingEvent = false;
          } else if ($scope.loggedIn && $scope.addingEvent) {
            if (document.URL.startsWith('http')) {
              if (event.start.dateTime == undefined) {
                gapi.client.calendar.events.insert({
                  "calendarId": user.email,
                  "resource": {
                    "end": {
                      "date": event.end.date
                    },
                    "start": {
                      "date": event.start.date
                    },
                    "location": event.location,
                    "summary": event.summary
                  }
                }).then(function (response) {
                  // Handle the results here (response.result has the parsed body).
                  console.log("Response", response);
                }, function (err) { console.error("Execute error", err); });
              } else {
                gapi.client.calendar.events.insert({
                  "calendarId": user.email,
                  "resource": {
                    "end": {
                      "dateTime": event.end.dateTime
                    },
                    "start": {
                      "dateTime": event.start.dateTime
                    },
                    "location": event.location,
                    "summary": event.summary
                  }
                }).then(function (response) {
                  // Handle the results here (response.result has the parsed body).
                  console.log("Response", response);
                }, function (err) { console.error("Execute error", err); });
                
              }
              
              $scope.addEventDb(event);
              $scope.showEventAddedAleart();

            } else if (ionic.Platform.isIOS() || ionic.Platform.is('android')) {
              $scope.addEventDb(event);
              $scope.showEventAddedAleart();

            } else {
              if (event.start.dateTime == undefined) {
                gapi.client.calendar.events.insert({
                  "calendarId": user.email,
                  "resource": {
                    "end": {
                      "date": event.end.date
                    },
                    "start": {
                      "date": event.start.date
                    },
                    "location": event.location,
                    "summary": event.summary
                  }
                }).then(function (response) {
                  // Handle the results here (response.result has the parsed body).
                  console.log("Response", response);
                }, function (err) { console.error("Execute error", err); });
              } else {
                gapi.client.calendar.events.insert({
                  "calendarId": user.email,
                  "resource": {
                    "end": {
                      "dateTime": event.end.dateTime
                    },
                    "start": {
                      "dateTime": event.start.dateTime
                    },
                    "location": event.location,
                    "summary": event.summary
                  }
                }).then(function (response) {
                  // Handle the results here (response.result has the parsed body).
                  console.log("Response", response);
                }, function (err) { console.error("Execute error", err); });
                
              }
              $scope.addEventDb(event);
              $scope.showEventAddedAleart();
            }
          }
          $scope.addingEvent = false;

        });
      }

      // ----------- 'Check-In' button functions ----------- //

      // ----------- Checks if user has already checked in to the event
      $scope.checkAlreadyCheckedIn = function (event) {
        firebase.auth().onAuthStateChanged(function (user) {
          if ($scope.loggedIn) {
            firebase.database().ref().child("googleUsers/" + user.uid + "/checkEvents").orderByChild("id")
              .equalTo(event.id).on("value", function (snapshot) {
                if (snapshot.exists()) {
                  $scope.alreadyCheckedIn = true
                } else {
                  $scope.alreadyCheckedIn = false
                }
              });
          }
        });
        return $scope.alreadyCheckedIn
      }

      // ----------- Inserts data
      $scope.checkingInUser = function (event) {
        firebase.auth().onAuthStateChanged(function (user) {
          var checkEventRef = ref.child("googleUsers/" + user.uid + "/checkEvents");
          checkEventRef.child(event.id).set({
            created: event.created,
            creator: event.creator,
            end: event.end,
            etag: event.etag,
            htmlLink: event.htmlLink,
            iCalUID: event.iCalUID,
            id: event.id,
            kind: event.kind,
            location: event.location,
            organizer: event.organizer,
            reminders: event.reminders,
            start: event.start,
            status: event.status,
            summary: event.summary,
            updated: event.updated
          }).then(function () {
            console.log('Event ' + $scope.summary + ' added')
          }, function (error) {
            console.log(error)
          });
        });
      }

      // ----------- Adds the event to the users database
      //Checkin Events for user
      $scope.checkingIn = false;
      $scope.checkinEvent = function (event) {
        $scope.checkingIn = true;
        firebase.auth().onAuthStateChanged(function (user) {
          if (!$scope.loggedIn && $scope.checkingIn) {
            $scope.showLogInAlert();
            $scope.checkingIn = false;
            return;
          } else if ($scope.loggedIn && $scope.checkingIn) {
            $scope.checkingInUser(event);
            $scope.showEventCheckInAlert();
            $scope.checkingIn = false;
          }
          $scope.checkingIn = false;
        });
        return $scope.checkingIn;
      }

      // ----------- 'Delete' button functions ----------- //

      // ----------- Removes the event from the users database
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

      // ----------- Popup function to confirm delete
      $scope.deleteEvent = function (id) {
        $scope.addingEvent = false;
        var confirmPopup = $ionicPopup.confirm({
          title: 'Delete Event',
          template: 'Are you sure you want to delete this event from the calendar?',
          cancelText: 'No',
          okText: 'Yes'
        });
        confirmPopup.then(function (res) {
          if (res) {
            $scope.deletingEvent(id);
            $scope.addingEvent = false;
            $console.log("Deleted Event");
          } else {
            $state.go("manageEvents");
          }
        });
      };


      /* ------ Sets and Changes address for Google Maps based on location MOVE TO APP.JS AND APPLY TO ALL EVENTS sometime ------ */

      $scope.currentAddress = null;

      $scope.setAddress = function (location) {

        $scope.strLocation = location.split(" ");
        $scope.eventLocation = $scope.strLocation[0];
        switch ($scope.eventLocation) {                       // Puts address based on building or location
          case "Neils":
            //$scope.address = "Neils Science Center, 1610 Campus Drive East, Valparaiso, IN";
            $scope.currentAddress = "Neils Science Center, 1610 Campus Drive East, Valparaiso, IN";
            $scope.address = "Neils Science Center, 1610 Campus Drive East, Valparaiso, IN";
            eventRef.update({
              address: $scope.currentAddress,
              location: location
            });
            //add to address info to database
            break;
          case "West":
            $scope.address = undefined;
            eventRef.update({
              address: $scope.currentAddress,
              location: location
            });
            break;
          case "Hearth":
          case "Cafe":
          case "Community":
          case "Ballrooms":
          case "Grand":
          case "Union":
            $scope.currentAddress = "Harre Union, Chapel Drive, Valparaiso, IN";
            $scope.address = "Harre Union, Chapel Drive, Valparaiso, IN";
            eventRef.update({
              address: $scope.currentAddress,
              location: location
            });
          case "Founders":
            //$scope.address = "Harre Union, Chapel Drive, Valparaiso, IN";
            $scope.currentAddress = "Harre Union, Chapel Drive, Valparaiso, IN";
            $scope.address = "Harre Union, Chapel Drive, Valparaiso, IN";
            eventRef.update({
              address: $scope.currentAddress,
              location: location
            });
            //add address to database
            break;
          default:
            $scope.address = location;
            eventRef.update({
              address: location,
              location: location
            });
            break;

        }
        return $scope.address;
      };

      /* ------ Changes Location ------ */
      // Triggered on a button click, or some other target

      $scope.possibleLocations = ["Neils", "Hearth", "Community Room", "Cafe", "Ballrooms", "Grand Lobby", "West Lawn", "Union", "None"];

      $scope.alterLocation = function (building) {
        $scope.building = building;
        $scope.room = {}
        if (building == "None") {
          $scope.address = "No location specified";
          $scope.location = "No location specified";
          $scope.closePopover();
          return;
        } else if (building == "Neils") {
          var myPopup = $ionicPopup.show({
            template: '<input type="number" ng-model="room.number">',
            title: 'Enter a Room Number',
            subTitle: 'Cancel if there is no room number.',
            scope: $scope,
            buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Save</b>',
                type: 'button',
                onTap: function (e) {
                  if (!$scope.room.number) {
                    //don't allow the user to save unless they enter a room number
                    if ($scope.room.number == 0) {
                      $scope.room.number = undefined;
                    } else {
                      e.preventDefault();
                    }
                  } else {
                    return $scope.room.number;
                  }
                }
              }
            ]
          });
          myPopup.then(function () {
            if ($scope.room.number == undefined) {
              $scope.location = $scope.building;

            } else {
              $scope.location = $scope.building + " " + $scope.room.number;
              $scope.current
              $scope.closePopover();
            }
          });
        } else {
          $scope.location = $scope.building;
          $scope.closePopover();
        }
      };

      /* ------ Popup for changing location ------ */
      var template = '<ion-popover-view><ion-header-bar> <h1 class="title">Choose a Location</h1> </ion-header-bar> <ion-content> Hello! </ion-content></ion-popover-view>';
      // .fromTemplate() method


      /* ------ Functions for Custom Popup ------ */
      $scope.popover = $ionicPopover.fromTemplate(template, {
        scope: $scope
      });

      // .fromTemplateUrl() method
      $ionicPopover.fromTemplateUrl('my-popover.html', {
        scope: $scope
      }).then(function (popover) {
        $scope.popover = popover;
      });

      $scope.openPopover = function ($event) {
        $scope.popover.show($event);
      };

      $scope.closePopover = function () {
        $scope.popover.hide();
      };

      //Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function () {
        $scope.popover.remove();
      });

      // Execute action on hidden popover
      $scope.$on('popover.hidden', function () {
        // Execute action
      });

      // Execute action on remove popover
      $scope.$on('popover.removed', function () {
        // Execute action
      });


      /* ------ Functions for Other Page Info ------ */
      $scope.call = function () {
        $window.open('tel: 219.464.5415', '_system');
      };

      $scope.mail = function () {
        $window.open('mailto: upc@valpo.edu', '_system');
      };

      $scope.website = function () {
        $window.open("https://www.valpo.edu/university-programming-council/", '_system');
      };

      $scope.map = function (address) {
        if (ionic.Platform.isIOS()) {
          $window.open('maps://?q=' + address, '_system');
        } else if (ionic.Platform.is('android')) {
          $window.open('geo://0,0?q=' + '(' + address + ')&z=15', '_system');

        } else {
          $window.open('https://www.google.com/maps/search/' + address);
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
