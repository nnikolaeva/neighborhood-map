/* main.js
 * Marker class which stores marker's information 
 * and ViewModel class, which contains all business logic.
 * author: Natalia Nikolaeva
 * data: Aug 31 2015
 */
"use strict";
var CLIENT_ID = "O4L3T0YIVRWVHCWIQ1Y1UHUXUDRBQ3S4AXKT4ZIQTSIKQMNN";
var CLIENT_SECRET = "5KVONUBGB0YJZJFMTAIXKGCMRB15KEVAGRY2YWMCCZF03EXC";
var COFFEE_IN_MTV_URL = "https://api.foursquare.com/v2/venues/search?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=20130815&near=Mountain View, CA&query=coffee";
var SUSHI_IN_MTV_URL = "https://api.foursquare.com/v2/venues/search?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=20130815&near=Mountain View, CA&query=sushi";
var places = [];

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
    self.name = place.name;
    self.address = place.address;
    self.lat = place.lat;
    self.lng = place.lng;
    self.iconType = place.iconType;
    self.id = place.id;
    self.infoWindowContent = null;
    self.mapMarker = null;
    self.activate = null;
    self.setInfoWindowContent = function(content) {
        self.infoWindowContent = content;
    };
    self.setMapMarker = function(mapMarker) {
        self.mapMarker = mapMarker;
    };
    self.setActivate = function(activate) {
        self.activate = activate;
    };
};


var ViewModel = function() {
    var MAP_CENTER_LAT = 37.4006792;
    var MAP_CENTER_LNG = -122.068216;
    var self = this;
    var map;
    self.markers = ko.observableArray([]);
    self.filteredMarkers = ko.observableArray([]);
    var markersLength;
    self.query = ko.observable("");
    var infowindow;
    self.initializeMap = function() {
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
            mapTypeControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER
            },
            scaleControl: true
        };
        map = new google.maps.Map(mapCanvas, mapOptions);
        // create boundaries for the map
        var sw = new google.maps.LatLng(37.369158, -122.115449);
        // var sw = new google.maps.LatLng(37.331507,-122.1974397);
        var ne = new google.maps.LatLng(37.445802, -121.9801157);
        // var ne = new google.maps.LatLng(37.436600, -121.992621);
        var mapBounds = new google.maps.LatLngBounds(sw, ne);
        map.fitBounds(mapBounds);
        // resize map if window is resized
        window.addEventListener('resize', function(e) {
            map.fitBounds(mapBounds);
        });
        infowindow = new google.maps.InfoWindow();
    };
    // create google maps markers and set them on the map
    self.initializeMarkers = function() {
        // create marker for each place
        places.forEach(function(item) {
            self.markers.push(new Marker(item));
        });
        markersLength = self.markers().length;
        // create copy of existing markers to use it for filtering
        for (var i = 0; i < markersLength; i++) {
            self.filteredMarkers.push(self.markers()[i]);
        }
        for (var i = 0; i < markersLength; i++) {
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

        if (marker.infoWindowContent !== null) {
            infowindow.setContent(marker.infoWindowContent);
            infowindow.open(map, marker.mapMarker);
        } else {
            var markerLocation = marker.lat + "," + marker.lng;
            var imageUrl = "https://maps.googleapis.com/maps/api/streetview?size=100x100&location=" + markerLocation;
            var compactVenueUrl = "https://api.foursquare.com/v2/venues/search?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=20130815&query=" + marker.name + "&intent=match&ll=" + markerLocation;
            // get data to fill in info window from foursquare api
            var venueDetailUrl = "https://api.foursquare.com/v2/venues/" + marker.id + "?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=20130815";
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var data = JSON.parse(xmlhttp.responseText);
                    createInfoWindow(marker, imageUrl, data.response.venue);
                } else if (xmlhttp.readyState == 4 && xmlhttp.status !== 200) {
                    createInfoWindowWithErrorMessage(marker);
                }
            };
            xmlhttp.open("GET", venueDetailUrl, true);
            xmlhttp.send();

        }
    }

    function createInfoWindow(marker, image, venue) {
        var venueAddress = marker.address;
        var venueRating = "Rating: " + venue.rating + "/10";
        var detailsLink = venue.canonicalUrl;
        //create a div container for info window
        var container = document.createElement('div');
        container.setAttribute("class", "info-window-container");

        // fill in template content
        var templateContent = document.getElementById("inforWindowTemplate").content;
        templateContent.getElementById("info-image").src = image;
        templateContent.getElementById("venue-name").innerHTML = marker.name;
        templateContent.getElementById("venue-address").innerHTML = venueAddress;
        templateContent.getElementById("venue-rating").innerHTML = venueRating;
        templateContent.getElementById("details-link").href = detailsLink;
        if (venue.hasOwnProperty("phrases")) {
            templateContent.getElementById("review").innerHTML = venue.phrases[0].sample.text;
        }
        // clone template content and insert it into infowindow container
        var clone = document.importNode(templateContent, true);
        container.appendChild(clone);

        // set info window to Marker class instance 
        marker.setInfoWindowContent(container);
        // set content to infoWindow object
        infowindow.setContent(container);
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
        var length = self.filteredMarkers().length;
        for (var i = 0; i < length; i++) {
            self.filteredMarkers()[i].mapMarker.setMap(map);
        }
    }

    // function filters markers
    self.filter = function() {
        // remove markers from the map
        setMapForMarkers(null);
        // remove markers from the list view
        self.filteredMarkers.removeAll();
        // find the markers whose name or address contains query string and add them to the list view
        var marker;
        for (var i = 0; i < markersLength; i++) {
            marker = self.markers()[i];
            if (marker.name.toLowerCase().indexOf(self.query().toLowerCase()) != -1 || marker.address.toLowerCase().indexOf(self.query().toLowerCase()) != -1) {
                self.filteredMarkers.push(marker);
            }
        }
        // add filtered markers on the map
        setMapForMarkers(map);
    };
};

// get Sushi and Coffee places from Foursquare API and save them in the places array.
ajaxRequest(COFFEE_IN_MTV_URL)
    .then(getCoffeePlaces, failCallback)
    .then(getSushiPlacesAndShowPlaces, failCallback);

function ajaxRequest(url) {
    var promise = new Promise(function(resolve, reject) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var data = JSON.parse(xmlhttp.responseText);
                resolve(data);
            } else if (xmlhttp.readyState == 4 && xmlhttp.status !== 200) {
                reject(data);
            }
        };

    });
    return promise;
}

function failCallback() {
    document.getElementById("venues-error-message").className = "visible";
}

function getSushiPlacesAndShowPlaces(data) {
    fillInPlacesArray(data.response.venues, "sushi");
    viewModel.initializeMarkers();
}

function getCoffeePlaces(data) {
    fillInPlacesArray(data.response.venues, "coffee");
    return ajaxRequest(SUSHI_IN_MTV_URL);
}

function fillInPlacesArray(venues, type) {
    for (var i in venues) {
        places.push({
            name: venues[i].name,
            address: createAddressString(venues[i].location),
            lat: venues[i].location.lat,
            lng: venues[i].location.lng,
            id: venues[i].id,
            iconType: type
        });
    }
}

function createAddressString(location) {
    var address = location.address + " " + location.city + ", " + location.state + " " + location.postalCode;
    return address;
}

// start application
var viewModel = new ViewModel();
ko.applyBindings(viewModel);
viewModel.initializeMap();
viewModel.query.subscribe(function() {
    viewModel.filter();
});