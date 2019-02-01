define([
  'app'
], function (app) {
  'use strict';

  app.service('dataService', [
    function () {
      this.events = [{
        id: 1,
        name: 'UPC Executive Meeting',
        city: 'Valparaiso',
        district: '236 Harre Union',
        street: 'Chapel Dr',
        number: '1509',
        zip: '46383',
        lat: 41.464278,
        lng:  -87.042168,
        satTrans: false,
        wheelChairLift: true,
        wheelChair: true,
        dates: [
          'Tuesday: 7:30 PM'
        ],
        contact: {
          tel: '2194645415',
          email: 'upc@valpo.edu'
        },
        website: 'https://www.valpo.edu/university-programming-council',
        images: 'https://www.valpo.edu/union/files/2016/06/Harre-Union.jpg'
      }, {
        id: 2,
        name: 'Hunger Banquet',
        city: 'Valparaiso',
        district: '236 Harre Union',
        street: 'Chapel Dr',
        number: '1509',
        zip: '46383',
        dates: [
          'Thursday: 6:00 PM - 8:00 PM'
        ],
        lat: 41.464278,
        lng:  -87.042168,
        satTrans: true,
        wheelchairLift: true,
        contact: {
          tel: '2194645415',
          email: 'upc@valpo.edu'
        },
        website: 'https://www.valpo.edu/university-programming-council',
        images: 'http://www.shive-hattery.com/Handler.ashx?Item_ID=91bdc848-ca16-47f9-a572-aded0abf8d9c'
      }, {id: 3,
        name: 'TEDxValparaisoUniversity',
        city: 'Valparaiso',
        district: '236 Harre Union',
        street: 'Chapel Dr',
        number: '1509',
        zip: '46383',
        dates: [
          'Friday: 4:00 PM - 9:00 PM'
        ],
        lat: 41.464278,
        lng:  -87.042168,
        satTrans: true,
        wheelChair: false,
        contact: {
          tel: '2194645415',
          email: 'upc@valpo.edu'
        },
        website: 'https://www.valpo.edu/university-programming-council',
        images: 'https://www.valpo.edu/union/files/2018/04/274-Auditorium-1.3-300x225.jpg'
      }];

      this.pages = [{
        id: 1,
        alias: 'about us',
        content: 'https://www.valpo.edu/university-programming-council/sample-page/about-us/',
        title: 'About Us',
        icon: 'ion-information-circled',
        url: 'app/templates/menu/about.html'
      }, {id:2,
        alias: 'perks',
        content: 'https://www.valpo.edu/university-programming-council/sample-page/crusader-perks/',
        title: 'Crusader Perks',
        icon: 'ion-trophy'
      }, {id: 3,
        alias: 'events',
        content: 'https://www.valpo.edu/university-programming-council/sample-page/events/',
        title: 'Programs and Events',
        icon: 'ion-location'
      }, {id: 4,
        alias: 'calendar',
        content: 'https://www.valpo.edu/university-programming-council/sample-page/calendar/',
        title: 'UPC Calendar',
        icon: 'ion-calendar'
      }, {id: 5,
        alias: 'rental',
        content: 'https://www.valpo.edu/university-programming-council/sample-page/rental-equipment/',
        title: 'Rental Equipment',
        icon: 'ion-xbox'
      }, {id: 6,
        alias: 'join',
        content: 'https://www.valpo.edu/university-programming-council/sample-page/join-our-team/',
        title: 'Join Our Team',
        icon: 'ion-person-stalker'
      }];
    }
  ]);
});
