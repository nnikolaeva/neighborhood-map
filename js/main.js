 var places = [{
     name: "Clocktower Coffee Roasting Company",
     lat: 37.3970472,
     lng: -122.0617372,
     iconType: "coffee"
 }, {
     name: "Le Boulanger",
     lat: 37.3891892,
     lng: -122.080007,
     iconType: "coffee"
 }, {
     name: "Sono Sushi",
     lat: 37.3917347,
     lng: -122.0799789,
     iconType: "sushi"
 }, {
     name: "Hon Sushi",
     lat: 37.4163068,
     lng: -122.0795238,
     iconType: "sushi"
 }, {
     name: "Satsuma Sushi",
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
     this.location = new google.maps.LatLng(place.lat, place.lng);
     this.mapMarker = new google.maps.Marker({
         position: this.location,
         map: map,
         icon: icons[place.iconType].icon
     });
     var infowindow = new google.maps.InfoWindow({
             content: self.name

         });
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
         // find the markers that contains query string and add them to the list view
         var marker;
         for (var i = 0; i < self.markers().length; i++) {
             marker = self.markers()[i];
             if (marker.name.toLowerCase().indexOf(self.query().toLowerCase()) != -1) {
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
         
         // add markers on the map
         //setMapForMarkers(self.filteredMarkers(), map);
         //self.setInfoWindow();
     };



 };
 var viewModel = new ViewModel();
 ko.applyBindings(viewModel);
 viewModel.initializeMap();
 viewModel.query.subscribe(function() {
     viewModel.filter();
 });