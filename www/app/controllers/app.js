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
    'GAPI',

    '$stateParams',
    'eventService',

    function ($scope, $ionicModal, $ionicScrollDelegate, $sce, pageService, $firebaseObject,
      $firebaseAuth, $firebaseArray, $window, $state, $ionicHistory, $ionicPopup, Calendar, Youtube, GAPI,
      $stateParams, eventService) {


      $scope.ready = true;
      var ref = firebase.database().ref();

      // ---------------- Get calendar  ------------------------
      var calRef = ref.child("calendar/events");
      var cal = $firebaseArray(calRef);
      console.log(cal);
      $scope.cal = $firebaseArray(calRef);
      var mycalRef = ref.child("myCalendar/events");
      var mycal = $firebaseArray(mycalRef);
      $scope.mycal = $firebaseArray(mycalRef);


      // -------- get google users -----------------
      var gUsersRef = ref.child("googleUsers");
      var googleUsers = $firebaseArray(gUsersRef);
      $scope.googleUsers = $firebaseArray(gUsersRef);

      // ------- formats calendar dates -----------
      $scope.dateFormat2 = function (place) {
        var eventRef = firebase.database().ref('calendar/events/' + place.$id);
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
          finalDate = startDate + " - " + endDate;

        }
        return finalDate;

      }

      //------------ get current user -------------------
      firebase.auth().onAuthStateChanged(function (user) {
        var googleUser = gapi.auth2.getAuthInstance().currentUser.get();


        var userId = googleUser.getId();
        // User is signed in
        var profileRef = firebase.database().ref('googleUsers/' + userId + '/');
        profileRef.on('value', function (snapshot) {
          console.log(snapshot.val())
          $scope.name = snapshot.val().name
          $scope.photoUrl = snapshot.val().photoUrl
          $scope.email = snapshot.val().email
          $scope.event = snapshot.val().events
          $scope.admin = snapshot.val().admin
        });
      });





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

      $scope.signOff = function () {
        $firebaseAuth().$signOut()

          .then(function () {
            console.log('Signout Succesfull')
            $scope.LoggedIn=false;
            $scope.LoginTitle="Log In"
            $state.go("dashboard")

          }, function (error) {
            console.log('Signout Failed')
          });
      }

      //might be used for reload after submitting of something
      $scope.reloadRoute = function () {
        $window.location.reload();
      }



      $ionicModal.fromTemplateUrl('app/templates/page.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.modal = modal;
      });

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

      GAPI.init().then(function () {
      }, function () { console.log('Something went wrong yes?'); });

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
          "maxResults": 20,
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


      gapi.load("client:auth2", function () {
        gapi.auth2.init({ client_id: '188526661745-1qvjgbd02e62kjg1it4tj05p14rveb21.apps.googleusercontent.com' });
      });

      GAPI.init().then(function () {
      }, function () { console.log('Something went wrong yes?'); });


      var gUserRef = ref.child("googleUsers"); //get users
      var googleUsers = $firebaseArray(gUserRef);
      $scope.googleUsers = $firebaseArray(gUserRef);



      // ------------ signs in with authentication ---------------------------
      $scope.login = function () {
        $scope.loadClient();
        gapi.auth2.getAuthInstance().signIn({ scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar" })
          .then(function () {
            console.log("Sign-in successful");
            $scope.LoggedIn=true;
            $scope.LoginTitle="Log Out";
            firebase.auth().onAuthStateChanged(function (user) {
              var googleUser = gapi.auth2.getAuthInstance().currentUser.get() //gets gppgle user
              $scope.isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get()
              var googleProfile = googleUser.getBasicProfile()
              $scope.googleProfile = googleUser.getBasicProfile()
              firebase.database().ref().child("googleUsers").orderByChild("email")
                .equalTo(googleProfile.getEmail()).on("value", function (snapshot) { //checks if user existis by checking if the email is in the db
                  if (snapshot.exists()) {  // account exists
                    console.log("exists");
                    console.log($scope.isSignedIn);

                  } else { //account deosn't exsist -> create new user
                    console.log("doesn't exist");
                    gUserRef.child(googleProfile.getId()).set({
                      name: googleProfile.getName(),
                      email: googleProfile.getEmail(),
                      photoUrl: googleProfile.getImageUrl(),
                      uid: googleProfile.getId(),
                      admin: false,
                      owner: false,
                    }, onComplete);
                  }
                });
            });
          }).then(function () {

            //sync calendar after sign in (should probably call it at a certian time of day and when event is added)
            $scope.sync();
            $state.go("dashboard"); //go to dashboard after sign in
          });

      }

      $ionicHistory.nextViewOptions({
        disableBack: true,
        disableAnimate: false,
        historyRoot: false,
        cache: false

      });

      // ---------- Switch login/ logout buttons --------------

      $scope.LoggedIn = false;
      $scope.LoginTitle = "Log In";
      
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

      $scope.clicked = function() {
          if ($scope.LoggedIn == false) {
              $scope.LoginTitle = "Log In";
              $scope.login();
          } else {
              $scope.signOff();
              $scope.LoginTitle = "Log Out"
          }
      }

    }
  ]);
});
