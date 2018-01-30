
// Global Variables. The Udacity Course had this inside the DOM
var map;

// Variables for Foursquare Authentication
var clientID, clientSecret;


    //Utilizing AppViewModel where 'this' points to the AVM
function AppViewModel() {
    var self = this;

    this.filter = ko.observable("");

    //mapmakers.js contains locations lat lg information. We pull the array here
    this.markers = [];

    //This function will poupulate the infoWindow with Foursquare information about the location
    // Address ( Street, City, Zip )
    this.populateInfoWindow = function(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.setContent('');
            infowindow.marker = marker;
            // Foursquare API Client
            clientID = "ZJ1GCQNVMIXRRXVMX3TN1F4LIYPD5IXMTYCYKEBZ0RRO4WUN";
            clientSecret =
                "QG3LDS34NMDAVVNGCK04ZELHYEEWQTLETFO02TKJNZYS5O4G";
            // URL for Foursquare API
            var apiUrl = 'https://api.foursquare.com/v2/venues/search?ll=' +
                marker.lat + ',' + marker.lng + '&client_id=' + clientID +
                '&client_secret=' + clientSecret + '&query=' + marker.title +
                '&v=20170708' + '&m=foursquare';
            // Foursquare API
            $.getJSON(apiUrl).done(function(marker) {
                var response = marker.response.venues[0];
                self.street = response.location.formattedAddress[0];
                self.city = response.location.formattedAddress[1];
                self.zip = response.location.formattedAddress[3];
                self.category = response.categories[0].shortName;

                self.htmlContentFoursquare =
                    '<h5 class="iw_subtitle">(' + self.category +
                    ')</h5>' + '<div>' +
                    '<h6 class="iw_address_title"> Address: </h6>' +
                    '<p class="iw_address">' + self.street + '</p>' +
                    '<p class="iw_address">' + self.city + '</p>' +
                    '</p>' + '</div>' + '</div>';

                infowindow.setContent(self.htmlContent + self.htmlContentFoursquare);
            }).fail(function() {


                // If Credentials are invalid or unable ot connect to FourSquare we display a message
                alert(
                    "Unable to connect to Foursquare."
                );
            });
            // Here in the customstyles.css file I make the title of the location bold and blue
            // Clicking the x
            this.htmlContent = '<div>' + '<h2 class="mapTitle">' + marker.title +
                '</h2>';
            infowindow.open(map, marker);

            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
    };

    this.populateAndBounceMarker = function() {
        self.populateInfoWindow(this, self.largeInfoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 1400);
    };

       // Initialze the MAP over the Neighborhood zoomed into the shopping plaza
    this.initMap = function() {
        var mapCanvas = document.getElementById('map');
        var mapOptions = {
            center: new google.maps.LatLng(34.071380, -84.276075),
            zoom: 17
        };
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(mapCanvas, mapOptions);

        // Set InfoWindow
        // Pulls data from array in mapmarkers.js
        this.largeInfoWindow = new google.maps.InfoWindow();
        for (var i = 0; i < nearAvalon.length; i++) {
            this.markerTitle = nearAvalon[i].title;
            this.markerLat = nearAvalon[i].lat;
            this.markerLng = nearAvalon[i].lng;
            // Google Maps marker setup
            this.marker = new google.maps.Marker({
                map: map,
                position: {
                    lat: this.markerLat,
                    lng: this.markerLng
                },
                title: this.markerTitle,
                lat: this.markerLat,
                lng: this.markerLng,
                id: i,
                animation: google.maps.Animation.DROP
            });
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', self.populateAndBounceMarker);
        }
    };

    this.initMap();

    // Knockout.js used here: function allows each location to be listed and filtering of that list.
    this.nearAvalonFilter = ko.computed(function() {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var markerLocation = this.markers[i];
            if (markerLocation.title.toLowerCase().includes(this.filter()
                    .toLowerCase())) {
                result.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}

googleError = function googleError() {
    alert(
        'There has been an with displaying the Map. Please check your connection and try again'
    );
};

function startApp() {
    ko.applyBindings(new AppViewModel());
}