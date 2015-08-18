 var places = [{
 	name: "name1",
 	location: new google.maps.LatLng(37.397952, -122.075726),
 	iconType: "grocery"
 }, {
 	name: "ka",
 	location: new google.maps.LatLng(37.3963314,-122.062567),
 	iconType: "coffee"
 }, {
 	name: "name3",
 	location: new google.maps.LatLng(37.3925052,-122.0793096),
 	iconType: "coffee"
 }, {
 	name: "name4",
 	location: new google.maps.LatLng(37.3887332,-122.0815788),
 	iconType: "coffee"
 }
 ]
 var icons = {
 	grocery: {
 		icon: "images/blue-pin.png" 
 	},
 	coffee: {
 		icon: "images/coffee.png"
 	}
 }

 // var Marker = function(place) {
 // 	this.
 // }



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
 	this.mapMarkers = ko.observableArray([]);
 	places.forEach(function(item) {
 		self.markers.push(item);
 	});
 	this.filteredMarkers = ko.observableArray([]);
 	for (var i = 0; i < self.markers().length; i++) {
 		self.filteredMarkers.push(self.markers()[i]);
 	}

 	this.query = ko.observable("");
 	this.filter = function() {
 		self.filteredMarkers.removeAll();

 		for (var i = 0; i < self.mapMarkers().length; i++) {
 			self.mapMarkers()[i].setMap(null);
 		}

 		for (var i = 0; i < self.markers().length; i++) {
 			if (self.markers()[i].name.indexOf(self.query()) != -1) {
 				self.filteredMarkers.push(self.markers()[i]);

 				var marker = new google.maps.Marker({
 				position: self.markers()[i].location,
 				map: map,
 				//icon: icons[place.iconType].icon
 		});
 			}
 		}

 		


 	}
 	this.initialize = function() {
 	// var mapCanvas = document.getElementById('map-canvas');
 	// var mapOptions = {
 	// 	center: new google.maps.LatLng(37.3878594, -122.0405356),
 	// 	zoom: 14,
 	// 	mapTypeId: google.maps.MapTypeId.ROADMAP
 	// }
 	// var map = new google.maps.Map(mapCanvas, mapOptions)

 	// var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';

 	for (var i = 0; i < self.filteredMarkers().length; i++) {
 		var marker = new google.maps.Marker({
 			position: self.filteredMarkers()[i].location,
 			map: map,
 			//icon: icons[place.iconType].icon
 		});
 		self.mapMarkers.push(marker);
 		

 	}
 	// Create the search box and link it to the UI element.
 	var input = document.getElementById("search-bar");
 	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
 	//var searchBox = new google.maps.places.SearchBox(input);
 }
 google.maps.event.addDomListener(window, 'load', self.initialize);
 }

 

 //google.maps.event.addDomListener(window, 'load', initialize);
 var viewModel = new ViewModel();
 ko.applyBindings(viewModel);
 //google.maps.event.addDomListener(window, 'load', initialize);
 viewModel.query.subscribe(function(){
 	viewModel.filter();
 });
