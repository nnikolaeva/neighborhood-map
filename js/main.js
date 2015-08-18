 var places = [{
     name: "name1",
     lat: 37.397952,
     lng: -122.075726,
     iconType: "grocery"
 }, {
     name: "ka",
     lat: 37.3963314,
     lng: -122.062567,
     iconType: "coffee"
 }]
 var icons = {
     grocery: {
         icon: "images/blue-pin.png"
     },
     coffee: {
         icon: "images/coffee.png"
     }
 }

 var Marker = function(place) {
     this.name = place.name;
     this.location = new google.maps.LatLng(place.lat, place.lng);
     this.mapMarker = new google.maps.Marker({
         position: this.location,
         map: null
             //icon: icons[place.iconType].icon
     });
 }



 var ViewModel = function() {
     var mapCanvas = document.getElementById('map-canvas');
     var mapOptions = {
         center: new google.maps.LatLng(37.3878594, -122.0405356),
         zoom: 14,
         mapTypeId: google.maps.MapTypeId.ROADMAP
     }
     var map = new google.maps.Map(mapCanvas, mapOptions)

     var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';

     var self = this;
     this.markers = ko.observableArray([]);
     places.forEach(function(item) {
         self.markers.push(new Marker(item));
     });
     this.filteredMarkers = ko.observableArray([]);
     for (var i = 0; i < self.markers().length; i++) {
         self.filteredMarkers.push(self.markers()[i]);
     }

     this.query = ko.observable("");
     this.filter = function() {
         for (var i = 0; i < self.filteredMarkers().length; i++) {
             self.filteredMarkers()[i].mapMarker.setMap(null);
         }

         self.filteredMarkers.removeAll();


         for (var i = 0; i < self.markers().length; i++) {
             if (self.markers()[i].name.indexOf(self.query()) != -1) {
                 self.filteredMarkers.push(self.markers()[i]);
             }

         }

         for (var i = 0; i < self.filteredMarkers().length; i++) {
             self.filteredMarkers()[i].mapMarker.setMap(map);
         }

     }
     this.initialize = function() {
         for (var i = 0; i < self.filteredMarkers().length; i++) {
             self.filteredMarkers()[i].mapMarker.setMap(map);
         }
         var input = document.getElementById("search-bar");
         map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
         //var searchBox = new google.maps.places.SearchBox(input);
     }
     google.maps.event.addDomListener(window, 'load', self.initialize);
 }
 var viewModel = new ViewModel();
 ko.applyBindings(viewModel);
 viewModel.query.subscribe(function() {
     viewModel.filter();
 });