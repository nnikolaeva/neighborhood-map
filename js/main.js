 var places = [{
     name: "Clocktower Coffee Roasting Co.",
     address: "205 E Middlefield Rd #1A Mountain View, CA 94043",
     lat: 37.3970472,
     lng: -122.0617372,
     iconType: "coffee"
 }, {
     name: "Sufi Coffee Shop",
     address: "815 W El Camino Real Mountain View, CA 94040",
     lat: 37.385884,
     lng: -122.0847306,
     iconType: "coffee"
 }, {
     name: "Oh My Sushi",
     address: "2595 California St Mountain View, CA 94040",
     lat: 37.4053954,
     lng: -122.1107026,
     iconType: "sushi"
 }, {
     name: "Hon Sushi",
     address: "1477 Plymouth St Mountain View, CA 94043",
     lat: 37.4163068,
     lng: -122.0795238,
     iconType: "sushi"
 }, {
     name: "Satsuma Sushi",
     address: "705 E El Camino Real Mountain View, CA 94040",
     lat: 37.3755308,
     lng: -122.0638239,
     iconType: "sushi"
 }];

 var icons = {
     sushi: {
         icon: "dist/images/sushi.png"
     },
     coffee: {
         icon: "dist/images/coffee.png"
     }
 };


 var Marker = function(place) {
     var self = this;
     this.name = place.name;
     this.address = place.address;
     this.lat = place.lat;
     this.lng = place.lng;
     this.iconType = place.iconType;
     this.infoWindow = null;
     this.mapMarker = null;
     this.activate = null;
     this.setInfoWindow = function(infowindow) {
         this.infoWindow = infowindow;
     };
     this.setMapMarker = function(mapMarker) {
         this.mapMarker = mapMarker;
     };
     this.setActivate = function(activate) {
         this.activate = activate;
     };
 };


 var ViewModel = function() {
     var MAP_CENTER_LAT = 37.4006792;
     var MAP_CENTER_LNG = -122.068216;
     var self = this;
     var map;
     this.markers = ko.observableArray([]);
     this.filteredMarkers = ko.observableArray([]);
     this.query = ko.observable("");

     this.initializeMap = function() {
         // create marker for each place
         places.forEach(function(item) {
             self.markers.push(new Marker(item));
         });
         // create copy of existing markers to use it for filtering
         for (var i = 0; i < self.markers().length; i++) {
             self.filteredMarkers.push(self.markers()[i]);
         }
         // create the map
         var mapCanvas = document.getElementById('map-canvas');
         var mapOptions = {
             center: new google.maps.LatLng(MAP_CENTER_LAT, MAP_CENTER_LNG),
             zoom: 13,
             mapTypeId: google.maps.MapTypeId.ROADMAP,
             panControl: false,
             zoomControl: true,
             zoomControlOptions: {
                 position: google.maps.ControlPosition.RIGHT_TOP
             },
             scaleControl: true
         };
         map = new google.maps.Map(mapCanvas, mapOptions);
         // create boundaries for the map
         var sw = new google.maps.LatLng(37.3989458, -122.1107519);
         var ne = new google.maps.LatLng(37.4024914, -122.0527303);
         var mapBounds = new google.maps.LatLngBounds(sw, ne);
         map.fitBounds(mapBounds);
         // resize map if window is resized
         window.addEventListener('resize', function(e) {
             map.fitBounds(mapBounds);
         });
     };
     // create google maps markers and set them on the map
     this.initializeMarkers = function() {
         for (var i = 0; i < self.markers().length; i++) {
             var marker = self.markers()[i];
             var mapMarker = new google.maps.Marker({
                 position: new google.maps.LatLng(marker.lat, marker.lng),
                 map: map,
                 icon: icons[marker.iconType].icon
             });
             marker.setMapMarker(mapMarker);
             marker.setActivate(activateMarker);
             mapMarker.addListener('click', makeClickHandler(marker));
         }

     };

     function makeClickHandler(marker) {
         return function() {
             activateMarker(marker);
         };
     }
     // animate marker and show info window
     function activateMarker(marker) {
         marker.mapMarker.setAnimation(google.maps.Animation.BOUNCE);
         setTimeout(function() {
             marker.mapMarker.setAnimation(null);
         }, 1400);

         if (marker.infoWindow !== null) {
             marker.infoWindow.open(map, marker.mapMarker);
         } else {
             var markerLocation = marker.lat + "," + marker.lng;
             var imageUrl = "https://maps.googleapis.com/maps/api/streetview?size=100x100&location=" + markerLocation;
             var CLIENT_ID = "O4L3T0YIVRWVHCWIQ1Y1UHUXUDRBQ3S4AXKT4ZIQTSIKQMNN";
             var CLIENT_SECRET = "5KVONUBGB0YJZJFMTAIXKGCMRB15KEVAGRY2YWMCCZF03EXC";
             var compactVenueUrl = "https://api.foursquare.com/v2/venues/search?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=20130815&query=" + marker.name + "&intent=match&ll=" + markerLocation;
             // get data to fill in info window from foursquare api
             $.getJSON(compactVenueUrl, function(data) {
                     var venueDetailUrl = "https://api.foursquare.com/v2/venues/" + data.response.venues[0].id + "?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=20130815";
                     $.getJSON(venueDetailUrl, function(data) {
                         createInfoWindow(marker, imageUrl, data.response.venue);
                     }).error(function() {
                         createInfoWindowWithErrorMessage(marker);
                     });
                 })
                 .error(function() {
                     createInfoWindowWithErrorMessage(marker);
                 });


         }
     }

     function createInfoWindow(marker, image, venue) {
         // create info window content
         var container = document.createElement('div');
         container.setAttribute("class", "info-window-container");
         $('<img>', {
             class: "info-image",
             src: '' + image
         }).appendTo(container);

         var content = $('<div>', {
             class: "content"
         }).appendTo(container);

         $('<h1>', {
             class: "venue-name",
             text: '' + venue.name
         }).appendTo(content);

         var venueAddress = venue.location.address + ", " + venue.location.city + ", " + venue.location.postalCode + ", " + venue.location.state;
         $('<h2>', {
             class: "venue-address",
             text: '' + venueAddress
         }).appendTo(content);

         var text = "Rating: " + venue.rating + "/10";
         $('<span>', {
             class: "venue-rating",
             text: '' + text
         }).appendTo(content);

         $('<a>', {
             class: "details-link",
             href: '' + venue.canonicalUrl,
             text: "View details"
         }).appendTo(content);

         if (venue.hasOwnProperty("phrases")) {
             $('<hr>').appendTo(content);
             $('<span>', {
                 class: "review",
                 text: '' + venue.phrases[0].sample.text
             }).appendTo(content);

         }
         // create info window
         var infowindow = new google.maps.InfoWindow({
             content: container
         });
         // set info window to Marker class instance 
         marker.setInfoWindow(infowindow);
         // open created info window on the map
         infowindow.open(map, marker.mapMarker);
     }

     function createInfoWindowWithErrorMessage(marker) {
         var infowindow = new google.maps.InfoWindow({
             content: "<div class='" + "error-message" + "'>Failed to load venue details from foursquare server</div>"
         });
         infowindow.open(map, marker.mapMarker);
     }
     // function displays markers on the map if parameter is equal to google.maps.Map object or remove markers from the map if parameter equals null
     function setMapForMarkers(map) {
         for (var i = 0; i < self.filteredMarkers().length; i++) {
             self.filteredMarkers()[i].mapMarker.setMap(map);
         }
     }

     // function filters markers
     this.filter = function() {
         // remove markers from the map
         setMapForMarkers(null);
         // remove markers from the list view
         self.filteredMarkers.removeAll();
         // find the markers whose name or address contains query string and add them to the list view
         var marker;
         for (var i = 0; i < self.markers().length; i++) {
             marker = self.markers()[i];
             if (marker.name.toLowerCase().indexOf(self.query().toLowerCase()) != -1 || marker.address.toLowerCase().indexOf(self.query().toLowerCase()) != -1) {
                 self.filteredMarkers.push(marker);
             }
         }
         // add filtered markers on the map
         setMapForMarkers(map);
     };

     this.isVisible = true;
     // function toggles list view visibility
     this.toggleListView = function() {
         if (self.isVisible === true) {
             $(".list-data").hide("slow");
             $(".show-list").text("View list");
             self.isVisible = false;
         } else {
             $(".list-data").show("slow");
             $(".show-list").text("Hide list");
             self.isVisible = true;
         }

     };

 };
 var viewModel = new ViewModel();
 ko.applyBindings(viewModel);
 viewModel.initializeMap();
 viewModel.initializeMarkers();
 viewModel.query.subscribe(function() {
     viewModel.filter();
 });