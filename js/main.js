 var places = [{
 	name: "name1",
 	location: new google.maps.LatLng(37.397952, -122.075726),
 	iconType: "grocery"
 }, {
 	name: "name2",
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



 var ViewModel = function() {
 	var self = this;
 	this.markers = ko.observableArray([]);
 	places.forEach(function(item) {
 		self.markers.push()
 	});
 }

 function initialize() {
 	var mapCanvas = document.getElementById('map-canvas');
 	var mapOptions = {
 		center: new google.maps.LatLng(37.3878594, -122.0405356),
 		zoom: 14,
 		mapTypeId: google.maps.MapTypeId.ROADMAP
 	}
 	var map = new google.maps.Map(mapCanvas, mapOptions)

 	var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
 	places.forEach(function(place) {
 		var marker = new google.maps.Marker({
 			position: place.location,
 			map: map,
 			//icon: icons[place.iconType].icon
 		});
 	});
 	// Create the search box and link it to the UI element.
 	//var input = document.getElementById("search-bar");
 	//map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

 	//var searchBox = new google.maps.places.SearchBox(input);
 	


 }
 google.maps.event.addDomListener(window, 'load', initialize);
 ko.applyBindings(new ViewModel());