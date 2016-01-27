// set up our global vars
var map;
var geocoder;

// initMap callback invoked when Google Maps API is ready (from Google Maps API site)
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 43.0500, lng: 87.9500},
        zoom: 8
    });

    geocoder = new google.maps.Geocoder();

    $('#search-button').on('click', function() {
        updateMapForecast(geocoder, map);
    });

    // instantiate the map to Milwaukee to start
    updateMapForecast(geocoder, map);
}

var updateMapForecast = function(geocoder, resultsMap) {
    // set address to search box value if one exists, else default to Milwaukee
    var address = $('#search').val() ? $('#search').val() : 'Milwaukee, WI';

    // set the #city span to the address
    $('#city').text(address);

    // call openweather for current weather and fire updateWeather when done, else, throw error to console
    $.ajax('http://api.openweathermap.org/data/2.5/weather?q=' + address + '&units=imperial&APPID=24ecd6a8da199d377072cfd7c3d2b21f')
        .done(function(data) {
            updateWeather(data);
        })
        .fail(function(err) {
            console.log(err);
        });

    // call openweather for 5-day forecastand fire updateForecast when done, else, throw error to console
    $.ajax('http://api.openweathermap.org/data/2.5/forecast/daily?q=' + address + '&cnt=5&units=imperial&APPID=24ecd6a8da199d377072cfd7c3d2b21f')
        .done(function(data) {
            updateForecast(data);
        })
        .fail(function(err) {
            console.log(err);
        });

    // Google Maps stuff, sets the address and redraws the map
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            //In this case it creates a marker, but you can get the lat and lng from the location.LatLng
            resultsMap.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location
            });
        } else {
        alert("Geocode was not successful for the following reason: " + status);
        }
    });
};

// from stackoverflow post for formatting the date evolved into a function to be used by updateForeast
// http://stackoverflow.com/questions/1531093/how-to-get-current-date-in-javascript
function getNiceDate(unix) {
    var today;
    var objToday = unix ? new Date(unix * 1000) : new Date();
    var weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    var dayOfWeek = weekday[objToday.getDay()];
    var domEnder = new Array( 'th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th' );
    var dayOfMonth = today + (objToday.getDate() < 10) ? '0' + objToday.getDate() + domEnder[objToday.getDate()] : objToday.getDate() + domEnder[parseFloat(("" + objToday.getDate()).substr(("" + objToday.getDate()).length - 1))];
    var months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
    var curMonth = months[objToday.getMonth()];
    var curYear = objToday.getFullYear();

    return dayOfWeek + ", the " + dayOfMonth + " of " + curMonth + ", " + curYear;
}


// from stackoverflow post for formatting string to Sentence Case:
// http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

// set the #today span to a NiceDate format
$('#today').text(getNiceDate());

// take a data param and manipulate the DOM with it's values
function updateWeather(data) {
    $('#main-icon').html('<img src="http://openweathermap.org/img/w/' + data.weather[0].icon + '.png" />');

    $('#current-weather').html(data.weather[0].description.toProperCase());
    $('#current-temp').html(parseInt(data.main.temp) + '&deg; F');
    $('#max').html(parseInt(data.main.temp_max) + '&deg; F');
    $('#min').html(parseInt(data.main.temp_min) + '&deg; F');
    $('#humidity').html(data.main.humidity + '%');
    $('#pressure').html(parseInt(0.02952998751 * data.main.pressure) + ' inHg'); // hectopascal to inch of mercury conversion from google search
    $('#wind-speed').html(data.wind.speed + ' mph');
    $('#wind-direction').html(parseInt(data.wind.deg) + '&deg;');
}

// take a data param and make a table to put into the DOM from it's values
function updateForecast(data) {
    var html;

    // iterate over collection to build the table
    $.each(data.list, function(i, el){
        var day = getNiceDate(el.dt);

        html +=
            '<tr><td>' + day +
            '</td><td><img src="http://openweathermap.org/img/w/' + el.weather[0].icon + '.png" />' +
            '</td><td>' + parseInt(el.temp.max) + '&deg; F' +
            '</td><td>' + parseInt(el.temp.min) + '&deg; F' +
            '</td></tr>';
    });

    // place the table in the DOM
    $('tbody').html(html);
}