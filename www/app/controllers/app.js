define([
  'app',
  'services/page'
], function (app) {
  'use strict';

  app.controller('AppCtrl', [
    '$scope',
    '$ionicModal',
    '$ionicScrollDelegate',
    '$sce',
    'pageService',
    '$firebaseObject',
    '$firebaseAuth',
    '$firebaseArray',
    '$window',
    '$state',
    '$ionicHistory',
    '$ionicPopup',
    'Calendar',
    'Youtube',
    '$stateParams',
    'eventService',

    function ($scope, $ionicModal, $ionicScrollDelegate, $sce, pageService, $firebaseObject,
      $firebaseAuth, $firebaseArray, $window, $state, $ionicHistory, $ionicPopup,
      $stateParams, eventService) {


      $scope.ready = true;


      var ref = firebase.database().ref();

      // ---------------- Get calendar  ------------------------
      var calRef = ref.child("calendar");
      var cal = $firebaseArray(calRef);

      var eventsRef = ref.child("events");
      $scope.events = $firebaseArray(eventsRef);
      console.log(cal);
      $scope.cal = $firebaseArray(calRef);
      var mycalRef = ref.child("mycalendar");
      var mycal = $firebaseArray(mycalRef);
      $scope.mycal = $firebaseArray(mycalRef);


      // -------- get google users -----------------
      var gUsersRef = ref.child("googleUsers");
      var googleUsers = $firebaseArray(gUsersRef);
      $scope.googleUsers = $firebaseArray(gUsersRef);

      $scope.sortDate = function (event) {
        var date = new Date(event.start.dateTime);
        return -date;
      };

      $scope.upcomingEvents = function (event) {
        var date = new Date();
        var eventDate = new Date(event.start.dateTime);
        return eventDate >= date;
      };

      // ------- formats calendar dates -----------
      $scope.dateFormat2 = function (place) {
        var eventRef = firebase.database().ref('calendar/' + place.$id);
        eventRef.on('value', function (snapshot) {
          $scope.dateTime = snapshot.val().start.dateTime
          $scope.start = snapshot.val().start.date
          $scope.end = snapshot.val().end.date
        });
        var date = new Date($scope.dateTime);
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

      //------------ get current user -------------------
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          // User is signed in
          var profileRef = firebase.database().ref('googleUsers/' + user.uid + '/');
          profileRef.on('value', function (snapshot) {
            //console.log(snapshot.val())
            $scope.name = snapshot.val().name
            $scope.photoUrl = snapshot.val().photoUrl
            $scope.email = snapshot.val().email
            $scope.event = snapshot.val().events
            $scope.admin = snapshot.val().admin
            $scope.owner = snapshot.val().owner
          });
        } else {
          $scope.admin = false
          $scope.owner = false
        }
      });


      firebase.database().ref().child("calendar/").orderByChild("id").on("value", function (snapshot) {
        var recent = Infinity;
        var recentEvent = "";
        var date = new Date();
        date.setDate(date.getDate());
        snapshot.forEach((child) => {
          var start = new Date(child.val().start.dateTime);
          if (start > date && (start < new Date(recent) || start < recent)) {
            recent = start;
            recentEvent = child.val();
          }


        });
        $scope.recentEvent = recentEvent
        $scope.summary = recentEvent.summary
        $scope.location = recentEvent.location
        $scope.startDate = recentEvent.start.dateTime
        $scope.endDate = recentEvent.end.dateTime
        $scope.start = recentEvent.start.date
        $scope.end = recentEvent.end.date
        $scope.id = recentEvent.id
        $scope.address = recentEvent.address
        console.log(recentEvent.summary)
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

      $scope.map = function () {
        if (ionic.Platform.isIOS()) {
          $window.open('maps://?q=' + $scope.address, '_system');
        } else if (ionic.Platform.is('android')) {
          $window.open('geo://0,0?q=' + '(' + $scope.address + ')&z=15', '_system');

        } else {
          $window.open('https://www.google.com/maps/search/' + $scope.address);
        }
      };


      //--------- hides tabs on pages --------------
      $scope.shouldHide = function () {
        switch ($state.current.name) {
          case 'profile':
            return true;
          case 'event':
            return true;
          case 'profileSettings':
            return true;
          case 'eventSettings':
            return true;
          case 'about':
            return true;
          case 'perks':
            return true;
          case 'programs':
            return true;
          case 'calendar':
            return true;
          case 'signIn':
            return true;
          default:
            return false;
        }
      }



      //might be used for reload after submitting of something
      $scope.reloadRoute = function () {
        $window.location.reload();
      }





      $scope.openModal = function (index) {
        var notEqual = index !== $scope.currentPage;
        if (notEqual) {
          $scope.opening = true;
          $scope.currentPage = index;
        }
        $scope.modal.show().then(function () {
          if (notEqual) {
            $ionicScrollDelegate.$getByHandle('modal').scrollTop();
          }
          $scope.opening = false;
        });
      };

      $scope.trustHtml = function (html) {
        return $sce.trustAsHtml(html);
      };

      $scope.closeModal = function () {
        $scope.modal.hide();
      };

      //disable back button
      /*$ionicHistory.nextViewOptions({
        disableBack: true,
        disableAnimate: false,
        historyRoot: true,
        cache: false

      });*/

      /*GAPI.init().then(function () {
      }, function () { console.log('Something went wrong yes?'); });*/

      // **************** Log In Here **************** //

      var ref = firebase.database().ref();


      var onComplete = function (error) {
        if (error) {
          console.log('Failed');
        } else {
          console.log('Completed');
        }
      };
      // ----------------- authentication for google calendar ------------------
      $scope.authenticate = function () {
        return gapi.auth2.getAuthInstance()
          .signIn({ scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar" })
          .then(function () { console.log("Sign-in successful"); },
            function (err) { console.error("Error signing in", err); });
      }
      $scope.loadClient = function () {
        return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest")
          .then(function () { console.log("GAPI client loaded for API"); },
            function (err) { console.error("Error loading GAPI client for API", err); });
      }


      //todays date for calendar sync
      var today = new Date();
      var day = today.getDate() + 1;
      var month = today.getMonth() + 1;
      var year = today.getFullYear();
      if (day < 10) {
        day = '0' + day;
      }
      if (month < 10) {
        month = '0' + month;
      }

      //---------------syncs calendar ---------
      var db = firebase.database();
      $scope.sync = function () {
        $scope.calendarEvents = gapi.client.calendar.events.list({
          "calendarId": "upc@valpo.edu",
          "maxResults": 30,
          "orderBy": "startTime",
          "singleEvents": true,
          "timeMin": year.toString() + "-" + month.toString() + "-" + day.toString() + "T00:00:00+10:00"
        })
          .then(function (response) {
            console.log("Response", response);
            $scope.upcEvents = response.result.items;
            db.ref().child('calendar').set({
              events: $scope.upcEvents
            });
          }, function (err) { console.error("Execute error", err); });


      }
      $scope.testSync = function () {
        $scope.calendarEvents = gapi.client.calendar.events.list({
          "calendarId": "miguel.valdez@valpo.edu",
          "maxResults": 20,
          "orderBy": "startTime",
          "singleEvents": true,
          "timeMin": year.toString() + "-" + month.toString() + "-" + day.toString() + "T00:00:00+10:00"
        })
          .then(function (response) {
            console.log("Response", response);
            $scope.upcEvents = response.result.items;
            db.ref().child('myCalendar').set({
              events: $scope.upcEvents
            });
          }, function (err) { console.error("Execute error", err); });


      }


      /*gapi.load("client:auth2", function () {
        gapi.auth2.init({ client_id: '188526661745-1qvjgbd02e62kjg1it4tj05p14rveb21.apps.googleusercontent.com' });
      });

      GAPI.init().then(function () {
      }, function () { console.log('Something went wrong yes?'); });*/


      var gUserRef = ref.child("googleUsers"); //get users
      var googleUsers = $firebaseArray(gUserRef);
      $scope.googleUsers = $firebaseArray(gUserRef);



      $ionicHistory.nextViewOptions({
        disableBack: false,
        disableAnimate: false,
        historyRoot: false,
        cache: false

      });

      $scope.pageBackButton = function () {
        $state.go("dashboard");
      }

      $scope.eventBackButton = function () {
        $state.go("calendar");
      }

      $scope.adminBackButton = function () {
        $state.go("eventSettings");
      }



      $scope.addEvent = function () {
        if ($scope.LoginTitle == "Log In") {
          console.log("Can't add an event without being logged in!");
          $scope.showLogInAlert();
          return;
        }
        firebase.auth().onAuthStateChanged(function (user) {

          firebase.database().ref().child("googleUsers/" + user.uid + "/events").orderByChild("id")
            .equalTo($scope.recentEvent.id).on("value", function (snapshot) {
              if (snapshot.exists()) {
                console.log("already added: ", $scope.recentEvent.summary)
              } else {
                if (ionic.Platform.isIOS() || ionic.Platform.is('android')) {
                  console.log("Phone")
                  var userEventRef = ref.child("googleUsers/" + user.uid + "/events");
                  userEventRef.child($stateParams.id).set({
                    created: $scope.recentEvent.created,
                    creator: $scope.recentEvent.creator,
                    end: $scope.recentEvent.end,
                    etag: $scope.recentEvent.etag,
                    htmlLink: $scope.recentEvent.htmlLink,
                    iCalUID: $scope.recentEvent.iCalUID,
                    id: $scope.recentEvent.id,
                    kind: $scope.recentEvent.kind,
                    location: $scope.recentEvent.location,
                    organizer: $scope.recentEvent.organizer,
                    reminders: $scope.recentEvent.reminders,
                    start: $scope.recentEvent.start,
                    status: $scope.recentEvent.status,
                    summary: $scope.recentEvent.summary,
                    updated: $scope.recentEvent.updated
                  }).then(function () {
                    console.log('Event ' + $scope.summary + ' added')
                    $scope.showEventAddedAleart();


                  }, function (error) {
                    console.log(error)
                  });
                } else { //if web
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
                    var userEventRef = ref.child("googleUsers/" + user.uid + "/events");
                    userEventRef.child($stateParams.id).set({
                      created: $scope.recentEvent.created,
                      creator: $scope.recentEvent.creator,
                      end: $scope.recentEvent.end,
                      etag: $scope.recentEvent.etag,
                      htmlLink: $scope.recentEvent.htmlLink,
                      iCalUID: $scope.recentEvent.iCalUID,
                      id: $scope.recentEvent.id,
                      kind: $scope.recentEvent.kind,
                      location: $scope.recentEvent.location,
                      organizer: $scope.recentEvent.organizer,
                      reminders: $scope.recentEvent.reminders,
                      start: $scope.recentEvent.start,
                      status: $scope.recentEvent.status,
                      summary: $scope.recentEvent.summary,
                      updated: $scope.recentEvent.updated
                    }).then(function () {
                      console.log('Event ' + $scope.recentEvent.summary + ' added')
                      $scope.showEventAddedAleart();


                    }, function (error) {
                      console.log(error)
                    });
                  }
                }



              }
            });

        });

      }


    }
  ]);
});
