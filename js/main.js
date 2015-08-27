 var places = [{
     name: "Clocktower Coffee Roasting Co.",
     address: "205 E Middlefield Rd #1A Mountain View, CA 94043",
     lat: 37.3970472,
     lng: -122.0617372,
     iconType: "coffee"
 }, {
     name: "Red Rock Coffee",
     address: "201 Castro St Mountain View, CA 94041",
     lat: 37.3936357,
     lng: -122.0788748,
     iconType: "coffee"
 }, {
     name: "Sufi Coffee Shop",
     address: "815 W El Camino Real Mountain View, CA 94040",
     lat: 37.385884,
     lng: -122.0847306,
     iconType: "coffee"
 }, {
     name: "Sono Sushi",
     address: "357 Castro St #3A Mountain View, CA 94041",
     lat: 37.3917347,
     lng: -122.0799789,
     iconType: "sushi"
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
         icon: "images/sushi.png"
     },
     coffee: {
         icon: "images/coffee.png"
     }
 };

 var Marker = function(place, map) {
 	
     var self = this;
     this.name = place.name;
     this.address = place.address;
     this.lat = place.lat;
     this.lng = place.lng;
     this.location = new google.maps.LatLng(place.lat, place.lng);
     this.mapMarker = new google.maps.Marker({
         position: this.location,
         map: map,
         icon: icons[place.iconType].icon
     });
     var infoLocation = place.lat + "," + place.lng;
     var infowindow;
     var imageUrl = "https://maps.googleapis.com/maps/api/streetview?size=100x100&location=" + infoLocation;

     // create info window for each marker with information from foursquare api
     var CLIENT_ID = "O4L3T0YIVRWVHCWIQ1Y1UHUXUDRBQ3S4AXKT4ZIQTSIKQMNN";
     var CLIENT_SECRET = "5KVONUBGB0YJZJFMTAIXKGCMRB15KEVAGRY2YWMCCZF03EXC";
     var compactVenueUrl = "https://api.foursquare.com/v2/venues/search?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=20130815&query=" + self.name + "&intent=match&ll=" + infoLocation;
     $.getJSON(compactVenueUrl, function(data) {
             var venueDetailUrl = "https://api.foursquare.com/v2/venues/" + data.response.venues[0].id + "?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=20130815";
             $.getJSON(venueDetailUrl, function(data) {
             	createInfoWindow(imageUrl, data.response.venue);
             }).error(function() {
             	createInfoWindowWithErrorMessage();
             });
         })
         .error(function() {
         	createInfoWindowWithErrorMessage();
         });

     function createInfoWindow(image, venue) {
     	var container = document.createElement('div');
         container.setAttribute("class", "info-window-container");
         $('<img src="' + image + '" class="info-image">').appendTo(container);

         var content = $('<div class="content"></div>');
         content.appendTo(container);

         $('<h1 class="venue-name">' + venue.name + '<h1>').appendTo(content);

         var venueAddress = venue.location.address + ", " + venue.location.city + ", <br> " + venue.location.postalCode + ", " + venue.location.state;
         $('<h2 class="venue-address">' + venueAddress + '</h2><br>').appendTo(content);

         $('<span class="venue-rating">Rating: ' + venue.rating + '/10</span>').appendTo(content);
         $('<a class="details-link" href="' + venue.canonicalUrl + '">View details</a><br>').appendTo(content);
         if (venue.hasOwnProperty("phrases")) {
             $('<hr><span class="review">' + venue.phrases[0].sample.text + '</span>').appendTo(content);
         }
         infowindow = new google.maps.InfoWindow({
                     content: container
                 })



        // if ('content' in document.createElement('template')) {
         	// var template = document.getElementById("test");
         	// //a = template.content.getElementById("venue-name");
         	// var newcontainer = document.getElementById("testTemplate");
         	// var clone = document.importNode(template.content, true);
         	// newcontainer.appendChild(clone);



         // } else {

         // }


     }

     function createInfoWindowWithErrorMessage() {
     	infowindow = new google.maps.InfoWindow({
                     content: "<div class='" + "error-message" + "'>Failed to load venue details from foursquare server</div>"
                 });
     }

     this.mapMarker.addListener('click', standOut);

     function standOut() {
         infowindow.open(map, self.mapMarker);
         self.mapMarker.setAnimation(google.maps.Animation.BOUNCE);
         setTimeout(function() {
             self.mapMarker.setAnimation(null);
         }, 1400);
     }
     this.showMarkerInfo = function() {
         standOut();
     };
 };

 var ViewModel = function() {
 	this.temp = ko.observable("hello Template");

     var self = this;
     var map;
     this.markers = ko.observableArray([]);
     this.filteredMarkers = ko.observableArray([]);
     this.query = ko.observable("");

     // function displays markers on the map
     function setMapForMarkers(markers, map) {
         for (var i = 0; i < markers.length; i++) {
             markers[i].mapMarker.setMap(map);
         }
     }

     // function filters markers
     this.filter = function() {
         // remove markers from the map
         setMapForMarkers(self.filteredMarkers(), null);
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
         setMapForMarkers(self.filteredMarkers(), map);
     };

     // function creates markers, create map and adds markers on the map
     this.initializeMap = function() {
         // create the map
         var mapCanvas = document.getElementById('map-canvas');
         var mapOptions = {
             center: new google.maps.LatLng(37.4006792, -122.068216),
             zoom: 14,
             mapTypeId: google.maps.MapTypeId.ROADMAP,
             panControl: false,
             zoomControl: true,
             zoomControlOptions: {
                 position: google.maps.ControlPosition.RIGHT_TOP
             },
             scaleControl: true
         };


         map = new google.maps.Map(mapCanvas, mapOptions);
         // create Markers from objects
         places.forEach(function(item) {
             self.markers.push(new Marker(item, map));
         });
         // create copy of existing markers to use it for filtering
         for (var i = 0; i < self.markers().length; i++) {
             self.filteredMarkers.push(self.markers()[i]);
         }
         var sw = new google.maps.LatLng(37.3989458, -122.1107519);
         var ne = new google.maps.LatLng(37.4024914, -122.0527303);
         var mapBounds = new google.maps.LatLngBounds(sw, ne);
         map.fitBounds(mapBounds);
         window.addEventListener('resize', function(e) {
             console.log("resized");
             map.fitBounds(mapBounds);
         });

     };

     this.toggleListView = function() {
         var displayStyle = $(".list-data").css("display");
         if (displayStyle === "block") {
             $(".list-data").hide("slow");
             $(".show-list").text("View list");
         } else {
             $(".list-data").show("slow");
             $(".show-list").text("Hide list");
         }

     }
     		var template = document.getElementById("test");
         	//a = template.content.getElementById("venue-name");
         	var newcontainer = document.getElementById("testTemplate");
         	var clone = document.importNode(template.content, true);
         	newcontainer.appendChild(clone);

 };
 var viewModel = new ViewModel();
 ko.applyBindings(viewModel);
 viewModel.initializeMap();
 viewModel.query.subscribe(function() {
     viewModel.filter();
 });