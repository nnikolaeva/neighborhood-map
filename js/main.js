/* main.js
 * Marker class which stores marker's information 
 * and ViewModel class, which contains all business logic.
 * author: Natalia Nikolaeva
 * data: Aug 31 2015
 */
"use strict";
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
        // create marker for each place
        places.forEach(function(item) {
            self.markers.push(new Marker(item));
        });
        markersLength = self.markers().length;
        // create copy of existing markers to use it for filtering
        for (var i = 0; i < markersLength; i++) {
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
            mapTypeControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER
            },
            scaleControl: true
        };
        map = new google.maps.Map(mapCanvas, mapOptions);
        // create boundaries for the map
        var sw = new google.maps.LatLng(37.369158, -122.115449);
        // var sw = new google.maps.LatLng(37.331507,-122.1974397);
        var ne = new google.maps.LatLng(37.445802,-121.9801157);
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
            var CLIENT_ID = "O4L3T0YIVRWVHCWIQ1Y1UHUXUDRBQ3S4AXKT4ZIQTSIKQMNN";
            var CLIENT_SECRET = "5KVONUBGB0YJZJFMTAIXKGCMRB15KEVAGRY2YWMCCZF03EXC";
            var compactVenueUrl = "https://api.foursquare.com/v2/venues/search?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=20130815&query=" + marker.name + "&intent=match&ll=" + markerLocation;
            // get data to fill in info window from foursquare api
            var venueDetailUrl = "https://api.foursquare.com/v2/venues/" + marker.id + "?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=20130815";
            var xmlhttp = new XMLHttpRequest();
             xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        var data = JSON.parse(xmlhttp.responseText);
                        console.log(imageUrl);
                        createInfoWindow(marker, imageUrl, data.response.venue);
                    } else if (xmlhttp.readyState == 4 && xmlhttp.status !== 200) {
                        createInfoWindowWithErrorMessage(marker);
                    }

                };
                xmlhttp.open("GET", venueDetailUrl, true);
                xmlhttp.send();

            // javascript promises
            //     var promise = new Promise(function(resolve, reject) {
            //         var xmlhttp = new XMLHttpRequest();
            //         xmlhttp.open("GET", compactVenueUrl, true);
            //         xmlhttp.onreadystatechange = function() {
            //           if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            //             var data = JSON.parse(xmlhttp.responseText);
            //             resolve(data);
            //         }  else if (xmlhttp.readyState == 4 && xmlhttp.status !== 200) {
            //             reject(data);
            //         }
            //     };
            //     xmlhttp.send();

            // });
            //chaining promises
            // function ajaxRequest(url) {
            //     var promise = new Promise(function(resolve, reject) {
            //         var xmlhttp = new XMLHttpRequest();
            //         xmlhttp.open("GET", url, true);
            //         xmlhttp.send();
            //         xmlhttp.onreadystatechange = function() {
            //           if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            //             var data = JSON.parse(xmlhttp.responseText);
            //             resolve(data);
            //         }  else if (xmlhttp.readyState == 4 && xmlhttp.status !== 200) {
            //             reject(data);
            //         }
            //     };

            // });
            //     return promise;
            // }

            // ajaxRequest(compactVenueUrl)
            // .then(getVenueDetails, failCallback)
            // .then(successCallback, failCallback);

            // function failCallback() {
            //     createInfoWindowWithErrorMessage(marker);
            // }
            // function successCallback(data) {
            //     createInfoWindow(marker, imageUrl, data.response.venue);
            // }
            // function getVenueDetails(data) {
            //     var venueDetailUrl = "https://api.foursquare.com/v2/venues/" + data.response.venues[0].id + "?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=20130815";
            //     return ajaxRequest(venueDetailUrl);
            // }




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

    // function toggles list view visibility
    self.toggleListView = function() {
        var isVisible = $('.list-data').css('display');
        if (isVisible === "block") {
            $(".list-data").hide("slow");
            $(".hide-list").hide();
            $(".show-list").show();
            isVisible = false;
        } else {
            $(".list-data").show("slow");
            $(".show-list").hide();
            $(".hide-list").show();
            isVisible = true;
        }
    };

};

function createAddressString(l) {
    var res = l.address + " " + l.city + ", " + l.state + " " + l.postalCode;
    return res;
}
var CLIENT_ID = "O4L3T0YIVRWVHCWIQ1Y1UHUXUDRBQ3S4AXKT4ZIQTSIKQMNN";
var CLIENT_SECRET = "5KVONUBGB0YJZJFMTAIXKGCMRB15KEVAGRY2YWMCCZF03EXC";
var newurl = "https://api.foursquare.com/v2/venues/search?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=20130815&near=Mountain View, CA&query=coffee";
var places = [];
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(this.responseText);
        var p = data.response.venues;
        console.log(p);
        for (var i in p) {
            places.push({name : p[i].name,
    address: createAddressString(p[i].location),
    lat: p[i].location.lat,
    lng: p[i].location.lng,
    id: p[i].id,
    iconType: "coffee"})
        }
        console.log(places);
        var viewModel = new ViewModel();
        ko.applyBindings(viewModel);
        viewModel.initializeMap();
        viewModel.initializeMarkers();
        viewModel.query.subscribe(function() {
            viewModel.filter();
        });
    } else if (this.readyState == 4 && this.status !== 200) {
        console.log("error");
    }
};
xmlhttp.open("GET", newurl, true);
xmlhttp.send();


// var viewModel = new ViewModel();
// ko.applyBindings(viewModel);
// viewModel.initializeMap();
// viewModel.initializeMarkers();
// viewModel.query.subscribe(function() {
//     viewModel.filter();
// });